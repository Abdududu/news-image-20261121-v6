[![make.fun · news-image-20261121](https://make.fun/badge/news-image-20261121.svg)](https://make.fun/bounty/news-image-20261121?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261121)
[![make.fun rank](https://make.fun/badge/news-image-20261121/Abdududu/news-image-20261121-v6/rank.svg)](https://make.fun/bounty/news-image-20261121?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261121)
[![make.fun reward](https://make.fun/badge/news-image-20261121/Abdududu/news-image-20261121-v6/reward.svg)](https://make.fun/bounty/news-image-20261121?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261121)

# The World in One Day — Saturday 21 November 2026

An illustrated digest of the day's world news: **36 real stories from 7 regions**, drawn as one image.

[See the bounty on make.fun](https://make.fun/bounty/news-image-20261121)

## What's inside

- A masthead for the day, a strip of six numbers that tell the story at a glance, and bars counting the stories by region.
- Three large illustrated hero cards: COP31 stuck in overtime on day 13, three missiles downed over Riyadh, and the magnitude 6.7 earthquake in Peru.
- Ten smaller illustrated cards: the strikes on Kyiv, missiles landing in Poland, the Davao diversion that saved 146 people, the Timor-Leste quake, Bitcoin's crash and rebound, Rahul's unbeaten 124, the Nasdaq plunge, the tanker ablaze near Hormuz, the capture of El Chapo Isidro, and Verstappen's inherited pole in Las Vegas.
- A world map with 13 numbered pins, a list of 23 more stories, and a DATE CHECK box that says plainly what was left out and why.

## How it is built

`main.ts` reads the 36 stories from `data/news.json`, builds a single 1024×1024 page with hand-drawn SVG illustrations (no external images), and renders it to `assets/news.png` with Playwright and Chromium. The output is deterministic: two runs produce the same bytes.

```sh
npm install
node main.ts
```

## Sources

Every story is dated Saturday 21 November 2026 and checked against the source of record: Reuters, AP, AFP, USGS, the Civil Aviation Authority of the Philippines, Formula 1, and CoinGecko.

## License

MIT — see [LICENSE](LICENSE).
