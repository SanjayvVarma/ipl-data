const puppeteer = require('puppeteer');
const fs = require('fs');

async function scrapeData(stat, season) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.iplt20.com/stats/${season}/${stat}`);

    const data = await page.evaluate(() => {
        const rows = document.querySelectorAll('.js-row');
        const result = [];
        rows.forEach(row => {
            const player = row.querySelector('.top-players__player-name').innerText.trim();
            const value = parseInt(row.querySelector('.top-players__r').innerText.replace(/,/g, ''), 10);
            result.push({ player, value });
        });
        return result.slice(0, 10);
    });

    await browser.close();
    return data;
}

async function scrapeAllData(season) {
    const stats = ['most-runs', 'most-fours', 'most-sixes', 'most-hundreds', 'most-fifties'];
    const allData = {};

    for (const stat of stats) {
        allData[stat] = await scrapeData(stat, season);
    }

    return allData;
}


function saveDataAsJSON(data, season) {
    const filename = `ipl_data_${season}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Data saved as ${filename}`);
}


const seasons = ['2019', '2020', '2021', '2022', '2023'];
for (const season of seasons) {
    scrapeAllData(season)
        .then(data => {
            saveDataAsJSON(data, season);
        })
        .catch(error => console.error(error));
}
