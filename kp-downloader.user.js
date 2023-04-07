// ==UserScript==
// @name         KinoPub Download button
// @namespace    http://tampermonkey/
// @version      0.1006
// @description  Injects a dropdown button to download the current episode/movie from KinoPub website
// @author       MrModest
// @match        https://*.kinopub.ru/item/view/*
// @match        https://*.qil.ovh/item/view/*
// @grant        none
// ==/UserScript==

(async function() {
  'use strict';

  const ACCESS_TOKEN = '7f2mskguqg0r23xk9corrzazvx56j8mg';

  try {
    injectLinks()
  } catch (error) {
    console.error('Something went wrong in KinoPub userscript!', error);
  }

  /**
   * @typedef { import('./models').ItemResponse} ItemResponse
   * @typedef { import('./models').Item } Item
   * @typedef { import('./models').DropdownItem DropdownItem}
   */

  async function injectLinks() {
    const episodeData = getEpisodeData();
    const media = await getMediaData(episodeData.mediaId);
    const isTvSeries = media.type === 'serial';

    const allEpisodes = getEpisodeUrls(media)

    const episode = isTvSeries 
      ? allEpisodes
          .find(e => e.season === episodeData.season && e.episode === episodeData.episode)
      : allEpisodes[0];

    const options = episode.options
      .map(f => ({ 
        url: f.url,
        text: f.quality,
        filename: episode.filename
      }));

    const dropdownHtml = getDropdownEl(options, isTvSeries);

    const rootEl = getInjectRoot(isTvSeries);
    rootEl.appendChild(dropdownHtml);
    if (isTvSeries) {
      rootEl.appendChild(getDownloadBulkDropdownEl(media, '1080p', episode.season))
    }
  }


  function getEpisodeData() {
    const data = window.location.pathname.matchAll(/\/item\/view\/(\d+)(\/s(\d+)e(\d+))?/g).next(); // '/item/view/12939/s1e2'
    return ({
      mediaId: data.value[1],
      season: parseInt(data.value[3]) || 0,
      episode: parseInt(data.value[4]) || 1
    });
  }

  function getInjectRoot(isTvSeries) {
    if (isTvSeries) {
      return document.querySelector('.season-title').parentElement;
    }
    return document.querySelector('#movie-status').parentElement;
  }

  /**
   * 
   * @param {DropdownItem[]} options 
   * @returns 
   */
  function getDropdownEl(options, isTvSeries) {
    const wrapper = document.createElement('div');
    const filename = isTvSeries ? options[0].filename : "Movie";

    wrapper.innerHTML = `
      <span class="dropdown">
        <button class="btn btn-secondary dropdown-toggle btn-outline-success m-b-sm" type="button" id="downloadButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Download (${filename})
        </button>
        <div class="dropdown-menu" aria-labelledby="downloadButton">
          ${
            options
              .map(o => `<a class="dropdown-item" href="${o.url}" download="${o.filename}">${o.text}</a>`)
              .join('\n')
          }
        </div>
      </span>
    `;

    return wrapper.firstElementChild;
  }

  function getDownloadBulkDropdownEl(media, quality, season) {
    const downloadMeta = 'data:text/json;charset=utf-8,'

    const wrapper = document.createElement('div');
    const filename = `JDownloader2${season ? '-' + season : ''}.crawljob`;
    const jsonSeson = downloadMeta + encodeURIComponent(JSON.stringify(getCrawljobJson(media, quality, season)));
    const jsonAll = downloadMeta + encodeURIComponent(JSON.stringify(getCrawljobJson(media, quality)));

    wrapper.innerHTML = `
      <span class="dropdown">
        <button class="btn btn-secondary dropdown-toggle btn-outline-success m-b-sm" type="button" id="downloadButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
          Download (.crawlJob)
        </button>
        <div class="dropdown-menu" aria-labelledby="downloadButton">
          <a class="dropdown-item" href="${jsonSeson}" download="${filename}">Весь сезон (${season})</a>
          <a class="dropdown-item" href="${jsonAll}" download="${filename}">Весь Сериал</a>
        </div>
      </span>
    `;

    return wrapper.firstElementChild;
  }

  /**
   * Get media by id
   * @param {number} mediaId 
   * @returns {Promise<Item>}
   */
  async function getMediaData(mediaId) {
    try {
      const r = await fetch(`https://api.service-kp.com/v1/items/${mediaId}?access_token=${ACCESS_TOKEN}`);
      /** @type {ItemResponse|undefined} */
      const response = await r.json();

      if (!response || response.status !== 200) {
        throw new Error(`Request finished with status ${(response || {}).status}`, { cause: response })
      }
      return response.item;
    } catch (error) {
      console.log('Error occur when tried to fetch movie data!', error)
      throw new Error(`Can't fetch the data for movie ${mediaId}!`, { cause: error })
    }
  }

  /**
   * Get download urls with particular video quality
   * @param {Item} media 
   * @param {string} quality
   * @returns 
   */
  function getEpisodeUrls(media) {
    const isTvSeries = (media.videos || []).length === 0

    const episodes = media.seasons
      ? media.seasons.flatMap(s => s.episodes)
      : media.videos || []

    return episodes
      .flatMap(e => {
        const fileName = isTvSeries ? `s${e.snumber}e${e.number}` : encodeForbiddenChars(media.title);
        const fileExt = e.files[0].file.split('.')[1];

        return ({
          options: e.files.map(f => ({ quality: f.quality, url: f.url.http })),
          filename: `${fileName}.${fileExt}`,
          episode: e.number,
          season: e.snumber,
          isTvSeries: isTvSeries
        })
      })
  }

  /**
   * Get `.crawljob` json for bulk download via JDownloader2
   * @param {Item} media 
   * @param {string} quality
   * @param {number|undefined} season if spesified, considers only specific season
   * @returns 
   */
  function getCrawljobJson(media, quality, season) {
    quality = quality || '1080p';
    const episodes = getEpisodeUrls(media)

    return episodes
      .filter(e => season === undefined || e.season === season)
      .flatMap(e => 
        ({
          text: e.options.find(f => f.quality === quality).url,
          filename: `e${e.episode}.mp4`,
          packageName: `s${e.season}`,
          autoStart: "TRUE",
          autoConfirm: "TRUE"
        })
      )
  }

  /* Utilitis */
  function encodeForbiddenChars(str) {
    const forbiddenChars = /[<>:"/\\|?*]/g;
    return str.replace(forbiddenChars, '_');
  }
})();