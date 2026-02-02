import express from 'express';
import axios from 'axios';
import Parser from 'rss-parser';
import cors from 'cors';
import path from 'path';

const app = express();
const parser = new Parser({
    customFields: {
        item: [
            ['media:content', 'mediaContent']
        ]
    }
});
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client/dist')));

// Mock Mode Configuration
const MOCK_MODE = process.env.MOCK_MODE === 'true' || false;

// Mock Data
const MOCK_DATA = {
    news: {
        items: [
            {
                title: "SpaceX successfully launches Starship on 5th test flight",
                pubDate: "Fri, 31 Jan 2026 12:00:00 GMT",
                contentSnippet: "The massive rocket achieved orbit and returned safely to the launch tower.",
                link: "#"
            },
            {
                title: "New breakthrough in fusion energy announced by scientists",
                pubDate: "Fri, 31 Jan 2026 10:30:00 GMT",
                contentSnippet: "Researchers have sustained a net energy gain for over 10 minutes.",
                link: "#"
            },
            {
                title: "Global weather patterns shift as El Niño subsides",
                pubDate: "Fri, 31 Jan 2026 09:15:00 GMT",
                contentSnippet: "Meteorologists predict cooler summers for the northern hemisphere.",
                link: "#"
            }
        ]
    },
    homeAssistant: {
        weather: {
            attributes: {
                temperature: 22,
                pressure: 1012,
                wind_speed: 5.5,
                wind_bearing: 180,
                forecast: Array.from({ length: 24 }, (_, i) => {
                    const date = new Date();
                    date.setHours(date.getHours() + i + 1, 0, 0, 0);
                    return {
                        datetime: date.toISOString(),
                        temperature: Math.round(20 + Math.sin(i / 12 * Math.PI) * 5),
                        condition: ['sunny', 'partlycloudy', 'cloudy', 'rainy'][Math.floor(Math.random() * 4)]
                    };
                })
            },
            state: "partlycloudy"
        },
        energy: {
            state: 15.4, // Current price in cents
            attributes: {
                average: 12.5,
                raw_today: Array.from({ length: 24 }, (_, i) => ({ start: `2026-01-31T${i.toString().padStart(2, '0')}:00:00`, value: Math.random() * 30 })),
                raw_tomorrow: Array.from({ length: 24 }, (_, i) => ({ start: `2026-02-01T${i.toString().padStart(2, '0')}:00:00`, value: Math.random() * 30 }))
            }
        },
        sun: {
            attributes: {
                next_rising: "2026-02-01T06:30:00",
                next_setting: "2026-01-31T18:45:00"
            }
        }
    }
};

// API: News Endpoint
app.get('/api/news', async (req, res) => {
    try {
        if (MOCK_MODE) {
            console.log('Serving Mock News Data');
            // Add mock images
            const enrichedNews = {
                ...MOCK_DATA.news,
                items: MOCK_DATA.news.items.map(item => ({
                    ...item,
                    image: `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/600`
                }))
            };
            return res.json(enrichedNews);
        }

        const rssUrls = (process.env.RSS_FEED_URL || 'https://news.google.com/rss')
            .split(',')
            .map(url => url.trim())
            .filter(url => url.length > 0);

        console.log(`Fetching RSS from: ${rssUrls.join(', ')}`);

        const feedPromises = rssUrls.map(url => parser.parseURL(url).catch(e => {
            console.error(`Error fetching feed ${url}: ${e.message}`);
            return null;
        }));

        const validFeeds = (await Promise.all(feedPromises)).filter(feed => feed !== null);

        if (validFeeds.length === 0) {
            // If all failed, throw error to be caught below
            throw new Error("Failed to fetch any RSS feeds");
        }

        let allItems = [];
        const titles = [];

        validFeeds.forEach(feed => {
            if (feed.title) titles.push(feed.title);

            // Process items
            const processedItems = feed.items.map(item => {
                let image = null;

                // 1. Check for media:content
                if (item.mediaContent) {
                    const mediaList = Array.isArray(item.mediaContent) ? item.mediaContent : [item.mediaContent];
                    const found = mediaList.find(m => {
                        const attrs = m['$'];
                        return attrs && attrs.url && (attrs.medium === 'image' || !attrs.medium);
                    });
                    if (found) {
                        image = found['$'].url;
                    }
                }

                // 2. Check for enclosure (standard RSS media attachment)
                if (!image && item.enclosure && item.enclosure.url) {
                    image = item.enclosure.url;
                }

                // 3. Fallback: Search for <img> tag in content
                if (!image) {
                    const content = item.content || item.contentSnippet || item.description || '';
                    const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
                    if (imgMatch) image = imgMatch[1];
                }

                // 4. Last resort: Mock image
                if (!image) {
                    image = `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/600`;
                }

                return { ...item, image, source: feed.title };
            });

            allItems = allItems.concat(processedItems);
        });

        // Sort combined items by date (descending)
        allItems.sort((a, b) => {
            const dateA = new Date(a.pubDate || 0);
            const dateB = new Date(b.pubDate || 0);
            return dateB - dateA;
        });

        // If multiple feeds, set title to null so client uses per-article source
        const combinedFeed = {
            title: titles.length === 1 ? titles[0] : null,
            items: allItems
        };

        res.json(combinedFeed);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        // Fallback to mock data on error
        res.status(500).json({ error: 'Failed to fetch news', details: error.message });
    }
});

// API: Home Assistant Endpoint
app.get('/api/home-assistant', async (req, res) => {
    try {
        if (MOCK_MODE || !process.env.HA_BASE_URL) {
            console.log('Serving Mock Home Assistant Data');
            return res.json(MOCK_DATA.homeAssistant);
        }

        const haBaseUrl = process.env.HA_BASE_URL;
        const config = {
            headers: {
                'Authorization': `Bearer ${process.env.HA_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        };

        // Fetch entities and forecast in parallel
        const [weather, energy, sun, forecastRes] = await Promise.all([
            axios.get(`${haBaseUrl}/api/states/weather.smhi_home`, config).catch(e => ({ data: null })),
            axios.get(`${haBaseUrl}/api/states/sensor.nordpool`, config).catch(e => ({ data: null })),
            axios.get(`${haBaseUrl}/api/states/sun.sun`, config).catch(e => ({ data: null })),
            axios.post(`${haBaseUrl}/api/services/weather/get_forecasts?return_response=true`, {
                entity_id: 'weather.smhi_home',
                type: 'hourly'
            }, config).catch(e => {
                console.error("Forecast fetch failed:", e.message);
                if (e.response) {
                }
                return { data: null };
            })
        ]);

        let weatherData = weather.data || MOCK_DATA.homeAssistant.weather;

        // Merge forecast data if available
        // Structure with return_response=true is usually { service_response: { "entity_id": { forecast: [...] } } }
        let forecastData = null;
        if (forecastRes && forecastRes.data) {
            if (forecastRes.data['weather.smhi_home']) {
                forecastData = forecastRes.data['weather.smhi_home'].forecast;
            } else if (forecastRes.data.service_response && forecastRes.data.service_response['weather.smhi_home']) {
                forecastData = forecastRes.data.service_response['weather.smhi_home'].forecast;
            }
        }

        if (forecastData) {
            weatherData = {
                ...weatherData,
                attributes: {
                    ...weatherData.attributes,
                    forecast: forecastData
                }
            };
        } else if (!weatherData.attributes.forecast) {
            // Fallback to mock forecast if real one failed and no attribute exists
            weatherData.attributes.forecast = MOCK_DATA.homeAssistant.weather.attributes.forecast;
        }

        const responseData = {
            weather: weatherData,
            energy: energy.data || MOCK_DATA.homeAssistant.energy,
            sun: sun.data || MOCK_DATA.homeAssistant.sun
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching HA data:', error.message);
        res.status(500).json({ error: 'Failed to fetch Home Assistant data' });
    }
});

// Serve Vue App for any other requests (SPA Support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist/index.html'));
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Mock Mode: ${MOCK_MODE}`);
});
