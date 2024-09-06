const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/get_m4a', async (req, res) => {
    const ytvideo_id = req.query.videoID;

    if (!ytvideo_id) {
        return res.status(400).json({ error: 'No videoID provided' });
    }

    const url = `https://video.genyt.net/${ytvideo_id}`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    };

    try {
        const response = await axios.get(url, { headers });
        const html = response.data;
        const $ = cheerio.load(html);

        let foundLinks = false;
        let m4aUrl = null;

        $('div.col-xl-3.col-lg-4.col-md-3.col-sm-4.col-6.mb-2').each((i, div) => {
            const linkTag = $(div).find('a[download]');
            const downloadAttr = linkTag.attr('download');
            const hrefAttr = linkTag.attr('href');

            if (downloadAttr && downloadAttr.endsWith('.m4a')) {
                m4aUrl = hrefAttr;
                foundLinks = true;
                return false; // Stop the loop when the first valid link is found
            }
        });

        if (foundLinks) {
            return res.json({ m4a_url: m4aUrl });
        } else {
            return res.status(404).json({ error: 'No M4A format URLs found' });
        }

    } catch (error) {
        return res.status(500).json({ error: `Error retrieving the page: ${error.message}` });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
