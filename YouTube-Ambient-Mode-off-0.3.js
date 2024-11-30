// ==UserScript==
// @name         YouTube-Ambient-Mode-off
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Мой скрипт который выключает "профессиональное освещение" он же "ambient mode" и ставит нормальное (на выбор) качество роликов на youtube
// @author       Khvalimov Maksim
// @match            *://*.youtube.com/*
// @match            *://*m.youtube.com/*
// @match            *://*.youtube-nocookie.com/*
// @icon         https://images.squarespace-cdn.com/content/v1/5a9dd11e2714e52449908751/1591907017940-3BU2VFMCN88O45KKK0O6/hd-youtube-logo-png-transparent-background-20.png
// @run-at       document-end
// @grant        none
// ==/UserScript==

(function() {
    'use strict';


    //Убрать окно которое напоминает о фоновой подствке
    //var okno = document.body.getElementByClassName(".style-scope.ytd-popup-container").style.display = "none";

    // Функция для отключения кинематографических функций (Основная)
    function disableAmbientMode(){
        //принудительно удалить мод из основного плеера.
        document.getElementById('cinematics-container').remove();

        //вот эта часть по сути скрывает мод через display (если не удалилось).
        var style = document.createElement("style");
        style.innerText = "#cinematics{display:none!important;}";
        document.head.appendChild(style);

    }

    // Запускаем функцию после загрузки страницы
    window.addEventListener('load', disableAmbientMode);





    //вырубить проф. освещение  ютуба на смартфоне
    //Функция для отключения кинематографических функций (Дополнительная)
    function disableAmbientModeMobile() {
        if (typeof ytcfg !== 'undefined') {
            // Проверяем, существует ли объект ytcfg
            const experimentFlags = ytcfg.get('EXPERIMENT_FLAGS');
            if (experimentFlags) {
                // Отключаем нужные флаги
                experimentFlags.kevlar_watch_cinematics = false;
                experimentFlags.mweb_cinematic_fullscreen = false;
                experimentFlags.mweb_cinematic_topbar = false;
                experimentFlags.mweb_cinematic_watch = false;

                // Устанавливаем обновленные флаги обратно
                ytcfg.set({
                    "EXPERIMENT_FLAGS": experimentFlags
                });

                console.log('YouTube-Ambient-Mode-off: Кинематографические функции отключены.');
            }
        } else {
           // console.log('ytcfg не найден. Ожидание загрузки...');
           // setTimeout(disableCinematicFeatures, 500); // Повторная попытка через 500 мс
        }
    }

    // Запускаем функцию после загрузки страницы
    window.addEventListener('load', disableAmbientModeMobile);


    // Функция для удаления  мода в shorts
    function removeCinematicShorts() {

        // Удаляем div с ID shorts-cinematic-container . То есть убираем саму подстветку.
        const cinematicContainer = document.getElementById('shorts-cinematic-container');
        if (cinematicContainer) {
            cinematicContainer.remove();
            console.log('YouTube-Ambient-Mode-off: shorts-cinematic-container удалён.');
        }

        // Удаляем опцию "Фоновая подсветка". Эта которую можно найти нажав 3 точки
        const ambientLightOption = Array.from(document.querySelectorAll('tp-yt-paper-item')).find(item => item.textContent.includes('Фоновая подсветка'));

        if (ambientLightOption) {
            ambientLightOption.remove();
            console.log('YouTube-Ambient-Mode-off:Опция "Фоновая подсветка" удалена.');
        }
    }

    //Я это сделал чтобы проверять не сработал ли снова скрипт который врубает тот самый мод

    // Создаем MutationObserver для отслеживания изменений в DOM.
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(() => {
            removeCinematicShorts(); // Проверяем и удаляем элементы при изменениях в DOM
        });
    });

    // Настройки наблюдателя: следим за добавлением или удалением дочерних элементов
    observer.observe(document.body, { childList: true, subtree: true });

    // Также запускаем проверку при загрузке страницы
    window.addEventListener('load', removeCinematicShorts);


    //автоматическое качество ютуб

    // --- SETTINGS -------

	// Target Resolution to always set to. If not available, the next best resolution will be used.
	const changeResolution = true;
	const targetRes = "hd1080";
	// Choices for targetRes are currently:
	//   "highres" >= ( 8K / 4320p / QUHD  )
	//   "hd2880"   = ( 5K / 2880p /  UHD+ )
	//   "hd2160"   = ( 4K / 2160p /  UHD  )
	//   "hd1440"   = (      1440p /  QHD  )
	//   "hd1080"   = (      1080p /  FHD  )
	//   "hd720"    = (       720p /   HD  )
	//   "large"    = (       480p         )
	//   "medium"   = (       360p         )
	//   "small"    = (       240p         )
	//   "tiny"     = (       144p         )

	// Target Resolution for high framerate (60 fps) videos
	// If null, it is the same as targetRes
	const highFramerateTargetRes = null;

	// If changePlayerSize is true, then the video's size will be changed on the page
	//   instead of using youtube's default (if theater mode is enabled).
	// If useCustomSize is false, then the player will be resized to try to match the target resolution.
	//   If true, then it will use the customHeight variables (theater mode is always full page width).
	const changePlayerSize = false;
	const useCustomSize = false;
	const customHeight = 600;

	// If autoTheater is true, each video page opened will default to theater mode.
	// This means the video will always be resized immediately if you are changing the size.
	// NOTE: YouTube will not always allow theater mode immediately, the page must be fully loaded before theater can be set.
	const autoTheater = false;

	// If flushBuffer is false, then the first second or so of the video may not always be the desired resolution.
	//   If true, then the entire video will be guaranteed to be the target resolution, but there may be
	//   a very small additional delay before the video starts if the buffer needs to be flushed.
	const flushBuffer = true;

	// Setting cookies can allow some operations to perform faster or without a delay (e.g. theater mode)
	// Some people don't like setting cookies, so this is false by default (which is the same as old behavior)
	const allowCookies = false;

	// Tries to set the resolution as early as possible.
	// This might cause issues on youtube polymer layout, so disable if videos fail to load.
	// If videos load fine, leave as true or resolution may fail to set.
	const setResolutionEarly = true;

	// Enables a temporary work around for an issue where users can get the wrong youtube error screen
	// (Youtube has two of them for some reason and changing to theater mode moves the wrong one to the front)
	// Try disabling if you can't interact with the video or you think you are missing an error message.
	const enableErrorScreenWorkaround = true;

	// --------------------




	// --- GLOBALS --------


	const DEBUG = false;

	// Possible resolution choices (in decreasing order, i.e. highres is the best):
	const resolutions = ['highres', 'hd2880', 'hd2160', 'hd1440', 'hd1080', 'hd720', 'large', 'medium', 'small', 'tiny'];
	// youtube has to be at least 480x270 for the player UI
	const heights = [4320, 2880, 2160, 1440, 1080, 720, 480, 360, 270, 270];

	let doc = document, win = window;

	// ID of the most recently played video
	let recentVideo = "";

	let foundHFR = false;

	let setHeight = 0;


	// --------------------


	function debugLog(message)
	{
		if (DEBUG)
		{
			console.log("YTHD | " + message);
		}
	}


	// --------------------


	// Used only for compatability with webextensions version of greasemonkey
	function unwrapElement(el)
	{
		if (el && el.wrappedJSObject)
		{
			return el.wrappedJSObject;
		}
		return el;
	}


	// --------------------


	// Get video ID from the currently loaded video (which might be different than currently loaded page)
	function getVideoIDFromURL(ytPlayer)
	{
		const idMatch = /(?:v=)([\w\-]+)/;
		let id = "ERROR: idMatch failed; youtube changed something";
		let matches = idMatch.exec(ytPlayer.getVideoUrl());
		if (matches)
		{
			id = matches[1];
		}

		return id;
	}


	// --------------------


	// Attempt to set the video resolution to desired quality or the next best quality
	function setResolution(ytPlayer, resolutionList)
	{
		debugLog("Setting Resolution...");

		const currentQuality = ytPlayer.getPlaybackQuality();
		let res = targetRes;

		if (highFramerateTargetRes && foundHFR)
		{
			res = highFramerateTargetRes;
		}

		// Youtube doesn't return "auto" for auto, so set to make sure that auto is not set by setting
		//   even when already at target res or above, but do so without removing the buffer for this quality
		if (resolutionList.indexOf(res) >= resolutionList.indexOf(currentQuality))
		{
			if (ytPlayer.setPlaybackQualityRange !== undefined)
			{
				ytPlayer.setPlaybackQualityRange(res);
			}
			ytPlayer.setPlaybackQuality(res);
			debugLog("Resolution Set To: " + res);
			return;
		}

		const end = resolutionList.length - 1;
		let nextBestIndex = Math.max(resolutionList.indexOf(res), 0);
		let ytResolutions = ytPlayer.getAvailableQualityLevels();
		debugLog("Available Resolutions: " + ytResolutions.join(", "));

		while ( (ytResolutions.indexOf(resolutionList[nextBestIndex]) === -1) && nextBestIndex < end )
		{
			++nextBestIndex;
		}

		if (flushBuffer && currentQuality !== resolutionList[nextBestIndex])
		{
			let id = getVideoIDFromURL(ytPlayer);
			if (id.indexOf("ERROR") === -1)
			{
				let pos = ytPlayer.getCurrentTime();
				ytPlayer.loadVideoById(id, pos, resolutionList[nextBestIndex]);
			}

			debugLog("ID: " + id);
		}
		if (ytPlayer.setPlaybackQualityRange !== undefined)
		{
			ytPlayer.setPlaybackQualityRange(resolutionList[nextBestIndex]);
		}
		ytPlayer.setPlaybackQuality(resolutionList[nextBestIndex]);

		debugLog("Resolution Set To: " + resolutionList[nextBestIndex]);
	}


	// --------------------


	// Set resolution, but only when API is ready (it should normally already be ready)
	function setResOnReady(ytPlayer, resolutionList)
	{
		if (ytPlayer.getPlaybackQuality === undefined)
		{
			win.setTimeout(setResOnReady, 100, ytPlayer, resolutionList);
		}
		else
		{
			let framerateUpdate = false;
			if (highFramerateTargetRes)
			{
				let features = ytPlayer.getVideoData().video_quality_features;
				if (features)
				{
					let isHFR = features.includes("hfr");
					framerateUpdate = isHFR && !foundHFR;
					foundHFR = isHFR;
				}
			}

			let curVid = getVideoIDFromURL(ytPlayer);
			if ((curVid !== recentVideo) || framerateUpdate)
			{
				recentVideo = curVid;
				setResolution(ytPlayer, resolutionList);

				let storedQuality = localStorage.getItem("yt-player-quality");
				if (!storedQuality || storedQuality.indexOf(targetRes) === -1)
				{
					let tc = Date.now(), te = tc + 2592000000;
					localStorage.setItem("yt-player-quality","{\"data\":\"" + targetRes + "\",\"expiration\":" + te + ",\"creation\":" + tc + "}");
				}
			}
		}
	}


	// --------------------


	function setTheaterMode(ytPlayer)
	{
		debugLog("Setting Theater Mode");

		if (win.location.href.indexOf("/watch") !== -1)
		{
			let pageManager = unwrapElement(doc.getElementsByTagName("ytd-watch-flexy")[0]);

			if (pageManager)
			{
				if (enableErrorScreenWorkaround)
				{
					const styleContent = "#error-screen { z-index: 42 !important } .ytp-error { display: none !important }";

					let errorStyle = doc.getElementById("ythdErrorWorkaroundStyleSheet");
					if (!errorStyle)
					{
						errorStyle = doc.createElement("style");
						errorStyle.type = "text/css";
						errorStyle.id = "ythdStyleSheet";
						errorStyle.innerHTML = styleContent;
						doc.head.appendChild(errorStyle);
					}
					else
					{
						errorStyle.innerHTML = styleContent;
					}
				}

				try
				{
					pageManager.theaterModeChanged_(true);
				}
				catch (e)
				{ /* Ignore internal youtube exceptions. */ }
			}
		}
	}


	// --------------------


	function computeAndSetPlayerSize()
	{
		let height = customHeight;
		if (!useCustomSize)
		{
			// don't include youtube search bar as part of the space the video can try to fit in
			let heightOffsetEl = doc.getElementById("masthead");
			let mastheadContainerEl = doc.getElementById("masthead-container");
			let mastheadHeight = 50, mastheadPadding = 16;
			if (heightOffsetEl && mastheadContainerEl)
			{
				mastheadHeight = parseInt(win.getComputedStyle(heightOffsetEl).height, 10);
				mastheadPadding = parseInt(win.getComputedStyle(mastheadContainerEl).paddingBottom, 10) * 2;
			}

			let i = Math.max(resolutions.indexOf(targetRes), 0);
			height = Math.min(heights[i], win.innerHeight - (mastheadHeight + mastheadPadding));
		}

		resizePlayer(height);
	}


	// --------------------


	// resize the player
	function resizePlayer(height)
	{
		debugLog("Setting video player size");

		if (setHeight === height)
		{
			debugLog("Player size already set");
			return;
		}

		let styleContent = "\
		ytd-watch-flexy[theater]:not([fullscreen]) #player-theater-container.style-scope { \
			min-height: " + height + "px !important; max-height: none !important; height: " + height + "px !important } \
		";

		let ythdStyle = doc.getElementById("ythdStyleSheet");
		if (!ythdStyle)
		{
			ythdStyle = doc.createElement("style");
			ythdStyle.type = "text/css";
			ythdStyle.id = "ythdStyleSheet";
			ythdStyle.innerHTML = styleContent;
			doc.head.appendChild(ythdStyle);
		}
		else
		{
			ythdStyle.innerHTML = styleContent;
		}

		setHeight = height;

		win.dispatchEvent(new Event("resize"));
	}


	// --- MAIN -----------


	function main()
	{
		let ytPlayer = doc.getElementById("movie_player") || doc.getElementsByClassName("html5-video-player")[0];
		let ytPlayerUnwrapped = unwrapElement(ytPlayer);

		if (autoTheater && ytPlayerUnwrapped)
		{
			if (allowCookies && doc.cookie.indexOf("wide=1") === -1)
			{
				doc.cookie = "wide=1; domain=.youtube.com";
			}

			setTheaterMode(ytPlayerUnwrapped);
		}

		if (changePlayerSize && win.location.host.indexOf("youtube.com") !== -1 && win.location.host.indexOf("gaming.") === -1)
		{
			computeAndSetPlayerSize();
			window.addEventListener("resize", computeAndSetPlayerSize, true);
		}

		if (changeResolution && setResolutionEarly && ytPlayerUnwrapped)
		{
			setResOnReady(ytPlayerUnwrapped, resolutions);
		}

		if (changeResolution || autoTheater)
		{
			win.addEventListener("loadstart", function(e) {
				if (!(e.target instanceof win.HTMLMediaElement))
				{
					return;
				}

				ytPlayer = doc.getElementById("movie_player") || doc.getElementsByClassName("html5-video-player")[0];
				ytPlayerUnwrapped = unwrapElement(ytPlayer);
				if (ytPlayerUnwrapped)
				{
					debugLog("Loaded new video");
					if (changeResolution)
					{
						setResOnReady(ytPlayerUnwrapped, resolutions);
					}
					if (autoTheater)
					{
						setTheaterMode(ytPlayerUnwrapped);
					}
				}
			}, true );
		}

		// This will eventually be changed to use the "once" option, but I want to keep a large range of browser support.
		win.removeEventListener("yt-navigate-finish", main, true);
	}

	main();
	// Youtube doesn't load the page immediately in new version so you can watch before waiting for page load
	// But we can only set resolution until the page finishes loading
	win.addEventListener("yt-navigate-finish", main, true);

})();