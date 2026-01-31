const express = require('express');
const axios = require('axios');
const Parser = require('rss-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
const parser = new Parser();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

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
                forecast: [
                    { datetime: "2026-02-01T12:00:00", temperature: 21, condition: "sunny" },
                    { datetime: "2026-02-02T12:00:00", temperature: 20, condition: "partlycloudy" },
                    { datetime: "2026-02-03T12:00:00", temperature: 19, condition: "rainy" }
                ]
            },
            state: "partlycloudy"
        },
        energy: {
            state: 15.4, // Current price in cents
            attributes: {
                raw_today: Array.from({ length: 24 }, (_, i) => ({ start: `2026-01-31T${i.toString().padStart(2, '0')}:00:00`, value: Math.random() * 30 })),
                raw_tomorrow: []
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

        const rssUrl = process.env.RSS_FEED_URL || 'https://news.google.com/rss';
        console.log(`Fetching RSS from: ${rssUrl}`);
        const feed = await parser.parseURL(rssUrl);

        // Attempt to extract images from content/description
        feed.items = feed.items.map(item => {
            const content = item.content || item.contentSnippet || item.description || '';
            const imgMatch = content.match(/<img[^>]+src="([^">]+)"/);
            const image = imgMatch ? imgMatch[1] : `https://picsum.photos/seed/${encodeURIComponent(item.title)}/800/600`; // Fallback image
            return { ...item, image };
        });

        res.json(feed);
    } catch (error) {
        console.error('Error fetching news:', error.message);
        // Fallback to mock data on error if desired, or return error
        res.status(500).json({ error: 'Failed to fetch news' });
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

        // Fetch entities in parallel
        const [weather, energy, sun] = await Promise.all([
            axios.get(`${haBaseUrl}/api/states/weather.smhi_home`, config).catch(e => ({ data: null })),
            axios.get(`${haBaseUrl}/api/states/sensor.nordpool`, config).catch(e => ({ data: null })),
            axios.get(`${haBaseUrl}/api/states/sun.sun`, config).catch(e => ({ data: null }))
        ]);

        const responseData = {
            weather: weather.data || MOCK_DATA.homeAssistant.weather,
            energy: energy.data || MOCK_DATA.homeAssistant.energy,
            sun: sun.data || MOCK_DATA.homeAssistant.sun
        };

        res.json(responseData);
    } catch (error) {
        console.error('Error fetching HA data:', error.message);
        res.status(500).json({ error: 'Failed to fetch Home Assistant data' });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Mock Mode: ${MOCK_MODE}`);
});
