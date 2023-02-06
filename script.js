function clamp(minval, value, maxval) {
	return [minval, value, maxval].sort((a, b) => a - b)[1]
};

const language = navigator.language == "ja" ? navigator.language : "en";
// const language = "en";
const ExamTypesDict = {
	1: 'jp',
	2: 'jg',
	3: 'jb',
	4: 's',
	5: 'r',
	6: 'h',
	7: 'c',
	8: 'a'
};

const ExamRangeDict = {
	1: 'm',
	2: 'l'
};


const DifficultyDict = {
	"oni": 3,
	"edit": 4,
	"ura": 4,
	"hard": 2,
	"normal": 1,
	"easy": 0,
	"kantan": 0,
	"futsuu": 1,
	"muzukashii": 2,
	"extreme": 3,
	"0": 0,
	"1": 1,
	"2": 2,
	"3": 3,
	"4": 4
};

const DOM_Text = document.querySelector("#text");
const DOM_Input_Text = document.querySelector("#input");
const DOM_Input_File = document.querySelector("#FileInput");
const DOM_Input_Select = document.querySelector("#SelectInput");
const DOM_NextButton = document.querySelector("#NextButton");
let songCount;
let examCount;
let workId = 0;
let charts = [];
let exams = [];
let chartName;
let nonGlobalIndexes = [];
let globalIndexes = [];
let tmpArr = [];
let chart = [];

/**
 * @param {EventTarget} eventTarget
 * @param {string} eventName
 */
const eventPromisify = (eventTarget, eventName) => {
	return new Promise((resolve, reject) => {
		eventTarget.addEventListener(eventName, (...args) => resolve(...args));
	});
};

const messages = {
	"ja": [
		"段位の曲数を入力してください [1-9]",
		"曲数",
		"段位の条件の数を入力してください [1-7]",
		"条件の数",
		"{i}番目の曲の譜面をアップロードしてください",
		"{i}番目の条件の範囲を指定してください",
		"共通",
		"曲別",
		"段位の名前を入力してください",
		"段位の名前",
		"金合格条件",
		"赤合格条件",
		"魂ゲージの赤合格条件を入力してください [0-100]",
		"魂ゲージの金合格条件を入力してください [{i}-100]",
		"{i}番目の条件を選んでください",
		"良の数",
		"可の数",
		"不可の数",
		"スコア",
		"連打数",
		"叩いた数",
		"コンボ数",
		"精度",
		"条件{i}の範囲を指定してください",
		"以上(赤合格条件<金合格条件)",
		"以下(赤合格条件>金合格条件)",
		"条件{i}の赤合格条件を指定してください[0-999999]",
		"条件{i}の金合格条件を指定してください[{j}-{k}]",
		"曲名「{i}」の難易度を選んでください",
		"曲名「{i}」の条件{j}の赤合格条件を指定してください[0-999999]",
		"曲名「{i}」の条件{j}の金合格条件を指定してください[{k}-{l}]",
		"DANTICK(見た目に使われるもの)を入力してください[0-5]",
		"DANTICKCOLORを入力してください。(例:#ffffff)"
	],
	"en": [
		"Enter the dan song count [1-9]",
		"SongCount",
		"Enter the dan exam count [1-7]",
		"ExamCount",
		"Enter the chart #{i}",
		"Enter the dan exam #{i} configuration type",
		"Global",
		"Individual",
		"Enter the dan chart name",
		"Dan chart name",
		"Exam gold condition",
		"Exam red condition",
		"Enter the Gauge exam red condition [0-100]",
		"Enter the Gauge exam gold condition [{i}-100]",
		"Enter the exam #{i} type",
		"Perfect count",
		"Good count",
		"Bad count",
		"Score",
		"Rolls",
		"Hit notes",
		"Combo",
		"Accurary",
		"Enter the exam #{i} range",
		"More",
		"Less",
		"Enter the exam #{i} red condition [0-999999]",
		"Enter the exam #{i} gold condition [{j}-{k}]",
		"Enter the Selected difficulty for the song {i}",
		"[Song {i} individual] Enter the exam {j} red condition [0-999999]",
		"[Song {i} individual] Enter the exam {j} gold condition [{k}-{l}]",
		"Enter the DANTICK value [0-5]",
		"Enter the DANTICKCOLOR string following the hex rgb format (Default : #ffffff)"
	]
};

const Difficult = {
	"ja": [
		"簡単",
		"普通",
		"難しい",
		"鬼(表)",
		"鬼(裏)"
	],
	"en": [
		"easy",
		"normal",
		"hard",
		"oni",
		"ura"
	]
};

const messages2 = {
	"ja":[
		"次へ→"
	],
	"en":[
		"next→"
	]
}

DOM_NextButton.textContent = messages2[language][0]

main1();
async function main1() {
	/* #1 何曲かきく */
	DOM_Text.textContent = messages[language][0];
	DOM_Input_Text.type = "number";
	DOM_Input_Text.min = "1";
	DOM_Input_Text.max = "9";
	DOM_Input_Text.placeholder = messages[language][1];
	DOM_Input_Text.classList.remove("hidden");

	/* #1の処理 */
	workId = 1
	DOM_Input_Text.addEventListener("change", Input_Text_Event)
	await eventPromisify(DOM_NextButton, "click");
	DOM_NextButton.disabled = true;
	songCount = clamp(1, parseInt(DOM_Input_Text.value), 9);
	DOM_Input_Text.removeEventListener("change", Input_Text_Event)

	/* #2 条件の数をきく */
	DOM_Text.textContent = messages[language][2];
	DOM_Input_Text.value = "";
	DOM_Input_Text.type = "number";
	DOM_Input_Text.min = "1";
	DOM_Input_Text.max = "7";
	DOM_Input_Text.placeholder = messages[language][3];

	/* #2の処理 */
	workId = 2;
	DOM_Input_Text.addEventListener("change", Input_Text_Event);
	await eventPromisify(DOM_NextButton, "click");
	DOM_NextButton.disabled = true;
	examCount = clamp(1, parseInt(DOM_Input_Text.value), 7);
	DOM_Input_Text.removeEventListener("change", Input_Text_Event)

	/* #3 曲の読み込み */
	for (i = 0; i <= songCount - 1; i++) {
		DOM_Text.textContent = messages[language][4].replace("{i}", i + 1);
		DOM_Input_Text.classList.add("hidden");
		DOM_Input_File.classList.remove("hidden");

		/* #3の処理 */
		DOM_Input_File.addEventListener("change", Input_File_Event);
		await eventPromisify(DOM_NextButton, "click");
		DOM_NextButton.disabled = true;
		var file_reader = new FileReader();
		file_reader.readAsText(DOM_Input_File.files[0]);
		file_reader.addEventListener('load', function(e) {
			charts.push(new Chart(e.target.result.replace(/\r?\n/g, "\n")));
			var dt = new DataTransfer();
			DOM_Input_File.files = dt.files;
		}, { once: true });
	}
	/* #4 条件に関する情報をきく */
	for (a = 1; a <= examCount; a++) {
		if (a == 1) {
			exams.push(new Exam(1, songCount));
		} else {
			DOM_NextButton.disabled = false;
			DOM_Input_Select.options.length = 0;
			DOM_Input_Select.options.add(new Option(messages[language][6], "1"));
			DOM_Input_Select.options.add(new Option(messages[language][7], "2"));
			DOM_Input_File.classList.add("hidden");
			DOM_Input_Select.classList.remove("hidden");
			DOM_Text.textContent = messages[language][5].replace("{i}", a);

			/* #4の処理 */
			await eventPromisify(DOM_NextButton, "click");
			var examConf = clamp(1, parseInt(DOM_Input_Select.value), 2);
			exams.push(new Exam(examConf, songCount));
			if (a == examCount) {
				break;
			}
		}
	}

	/* #5 段位の名前をきく */
	DOM_Input_Text.classList.remove("hidden");
	DOM_Input_File.classList.add("hidden");
	DOM_Input_Select.classList.add("hidden");
	DOM_NextButton.disabled = true;
	DOM_Text.textContent = messages[language][8];
	DOM_Input_Text.value = "";
	DOM_Input_Text.type = "text";
	DOM_Input_Text.placeholder = messages[language][9];

	/* #5の処理 */
	workId = 3;
	DOM_Input_Text.addEventListener("change", Input_Text_Event);
	await eventPromisify(DOM_NextButton, "click");
	DOM_NextButton.disabled = true;
	chartName = DOM_Input_Text.value;
	DOM_Input_Text.removeEventListener("change", Input_Text_Event);

	document.getElementById("1").classList.remove("bg-green-400","text-white");
	document.getElementById("1").classList.add("border","border-green-400","bg-white","text-green-400");
	document.getElementById("2").classList.remove("border","border-green-400","bg-white","text-green-400");
	document.getElementById("2").classList.add("bg-green-400","text-white");
	
	/* #6 条件が共通のものの処理 */
	for (b = 0; b <= examCount - 1; b++) {
		if (exams[b].configuration == 1) {
			if (b == 0) {
				/* #6-1-1 魂ゲージの金合格条件 */
				DOM_Input_Text.classList.remove("hidden");
				DOM_Input_File.classList.add("hidden");
				DOM_Input_Select.classList.add("hidden");
				DOM_NextButton.disabled = true;
				DOM_Text.textContent = messages[language][12];
				DOM_Input_Text.value = "";
				DOM_Input_Text.type = "number"
				DOM_Input_Text.min = 0;
				DOM_Input_Text.max = 100;
				DOM_Input_Text.placeholder = messages[language][11];

				/* #6-1-1の処理 */
				workId = 4;
				DOM_Input_Text.addEventListener("change", Input_Text_Event);
				await eventPromisify(DOM_NextButton, "click");
				exams[0].Parts[0].redPass = clamp(0, parseInt(DOM_Input_Text.value), 100);
				DOM_Input_Text.removeEventListener("change", Input_Text_Event);

				/* #6-1-2 魂ゲージの赤合格条件 */
				DOM_NextButton.disabled = true;
				DOM_Text.textContent = messages[language][13].replace("{i}", exams[0].Parts[0].redPass);
				DOM_Input_Text.value = "";
				DOM_Input_Text.type = "number"
				DOM_Input_Text.min = exams[0].Parts[0].redPass;
				DOM_Input_Text.max = 100;
				DOM_Input_Text.placeholder = messages[language][10];

				/* 6-1-2の処理 */
				workId = 5;
				DOM_Input_Text.addEventListener("change", Input_Text_Event);
				await eventPromisify(DOM_NextButton, "click");
				exams[0].Parts[0].goldPass = clamp(exams[0].Parts[0].redPass, parseInt(DOM_Input_Text.value), 100);
				DOM_Input_Text.removeEventListener("change", Input_Text_Event);
			}
			else {
				/* #6-x-1 それぞれの条件(魂を除く) */
				DOM_Text.textContent = messages[language][14].replace("{i}", b + 1);
				DOM_Input_Text.classList.add("hidden");
				DOM_Input_File.classList.add("hidden");
				DOM_Input_Select.classList.remove("hidden");
				DOM_Input_Select.options.length = 0;
				DOM_Input_Select.options.add(new Option(messages[language][15], "1"));
				DOM_Input_Select.options.add(new Option(messages[language][16], "2"));
				DOM_Input_Select.options.add(new Option(messages[language][17], "3"));
				DOM_Input_Select.options.add(new Option(messages[language][18], "4"));
				DOM_Input_Select.options.add(new Option(messages[language][19], "5"));
				DOM_Input_Select.options.add(new Option(messages[language][20], "6"));
				DOM_Input_Select.options.add(new Option(messages[language][21], "7"));
				DOM_Input_Select.options.add(new Option(messages[language][22], "8"));

				/* #6-x-1の処理 */
				DOM_NextButton.disabled = false;
				await eventPromisify(DOM_NextButton, "click");
				tmp = clamp(1, parseInt(DOM_Input_Select.value), 8)
				exams[b].Parts[0].examType = ExamTypesDict[tmp]

				/* #6-x-2 条件が以上か以下か */
				DOM_Text.textContent = messages[language][23].replace("{i}", b + 1);
				DOM_Input_Select.options.length = 0;
				DOM_Input_Select.options.add(new Option(messages[language][24], "1"));
				DOM_Input_Select.options.add(new Option(messages[language][25], "2"));

				/* #6-x-2の処理 */
				DOM_NextButton.disabled = false;
				await eventPromisify(DOM_NextButton, "click");
				tmp = clamp(1, parseInt(DOM_Input_Select.value), 2)
				exams[b].Parts[0].examRange = ExamRangeDict[tmp]

				/* #6-x-3 合格条件の指定 */
				/* #6-x-3-1 赤合格条件の指定 */
				DOM_NextButton.disabled = true;
				DOM_Input_Text.classList.remove("hidden");
				DOM_Input_File.classList.add("hidden");
				DOM_Input_Select.classList.add("hidden");
				DOM_Input_Text.type = "number";
				DOM_Input_Text.min = 0;
				DOM_Input_Text.max = 999999;
				DOM_Input_Text.value = "";
				DOM_Text.textContent = messages[language][26].replace("{i}", b + 1);

				/* #6-x-3-1の処理 */
				workId = 6;
				DOM_Input_Text.addEventListener("change", Input_Text_Event);
				await eventPromisify(DOM_NextButton, "click");
				exams[b].Parts[0].redPass = clamp(0, parseInt(DOM_Input_Text.value), 999999);
				DOM_Input_Text.removeEventListener("change", Input_Text_Event);

				/* #6-x-3-2 金合格条件の指定 */
				if (exams[b].Parts[0].examRange == "m") {
					DOM_NextButton.disabled = true;
					DOM_Input_Text.classList.remove("hidden");
					DOM_Input_File.classList.add("hidden");
					DOM_Input_Select.classList.add("hidden");
					DOM_Input_Text.type = "number";
					DOM_Input_Text.min = exams[b].Parts[0].redPass;
					DOM_Input_Text.max = 999999;
					DOM_Input_Text.value = "";
					DOM_Text.textContent = messages[language][27].replace("{i}", b + 1).replace("{j}", exams[b].Parts[0].redPass).replace("{k}", 999999);

					/* #6-x-3-2の処理 */
					workId = 7;
					tmpArr = [exams[b].Parts[0].redPass, 999999]
					DOM_Input_Text.addEventListener("change", Input_Text_Event);
					await eventPromisify(DOM_NextButton, "click");
					exams[b].Parts[0].goldPass = clamp(exams[b].Parts[0].redPass, parseInt(DOM_Input_Text.value), 999999);
					DOM_Input_Text.removeEventListener("change", Input_Text_Event);
				} else {
					DOM_NextButton.disabled = true;
					DOM_Input_Text.classList.remove("hidden");
					DOM_Input_File.classList.add("hidden");
					DOM_Input_Select.classList.add("hidden");
					DOM_Input_Text.type = "number";
					DOM_Input_Text.min = 0;
					DOM_Input_Text.max = exams[b].Parts[0].redPass;
					DOM_Input_Text.value = "";
					DOM_Text.textContent = messages[language][27].replace("{i}", b + 1).replace("{j}", 0).replace("{k}", exams[b].Parts[0].redPass);

					/* #6-x-3-2の処理 */
					workId = 7;
					tmpArr = [0, exams[b].Parts[0].redPass]
					DOM_Input_Text.addEventListener("change", Input_Text_Event);
					await eventPromisify(DOM_NextButton, "click");
					exams[b].Parts[0].goldPass = clamp(0, parseInt(DOM_Input_Text.value), exams[b].Parts[0].redPass);
					DOM_Input_Text.removeEventListener("change", Input_Text_Event);
				}
			}
			globalIndexes.push(b);
		} else {
			nonGlobalIndexes.push(b);
		}
	}

	document.getElementById("2").classList.remove("bg-green-400","text-white");
	document.getElementById("2").classList.add("border","border-green-400","bg-white","text-green-400");
	document.getElementById("3").classList.remove("border","border-green-400","bg-white","text-green-400");
	document.getElementById("3").classList.add("bg-green-400","text-white");
	/* #7 それぞれの曲の難易度を選択 */
	var difficulties = [];
	for (c = 0; c <= songCount - 1; c++) {
		DOM_Text.textContent = messages[language][28].replace("{i}", charts[c].title);
		DOM_NextButton.disabled = false;
		DOM_Input_Text.classList.add("hidden");
		DOM_Input_File.classList.add("hidden");
		DOM_Input_Select.classList.remove("hidden");
		DOM_Input_Select.options.length = 0;
		for (d = 0; d <= 4; d++) {
			if (charts[c].difficulties[d] != null) [
				DOM_Input_Select.options.add(new Option(`${Difficult[language][d]}-★${charts[c].difficulties[d].starRating}`, d))
			]
		}

		/* #7の処理 */
		await eventPromisify(DOM_NextButton, "click");
		difficulties.push(clamp(1, parseInt(DOM_Input_Select.value) + 1, 5))
		// c=c+1;
	}

	/* #8-x-1 共通でない条件の指定 */
	for (e of nonGlobalIndexes) {
		DOM_Text.textContent = messages[language][14].replace("{i}", e + 1);
		DOM_Input_Text.classList.add("hidden");
		DOM_Input_File.classList.add("hidden");
		DOM_Input_Select.classList.remove("hidden");
		DOM_Input_Select.options.length = 0;
		DOM_Input_Select.options.add(new Option(messages[language][15], "1"));
		DOM_Input_Select.options.add(new Option(messages[language][16], "2"));
		DOM_Input_Select.options.add(new Option(messages[language][17], "3"));
		DOM_Input_Select.options.add(new Option(messages[language][18], "4"));
		DOM_Input_Select.options.add(new Option(messages[language][19], "5"));
		DOM_Input_Select.options.add(new Option(messages[language][20], "6"));
		DOM_Input_Select.options.add(new Option(messages[language][21], "7"));
		DOM_Input_Select.options.add(new Option(messages[language][22], "8"));

		/* #8-x-1の処理 */
		await eventPromisify(DOM_NextButton, "click");
		tmp = clamp(1, parseInt(DOM_Input_Select.value), 8);
		exams[e].Parts[0].examType = ExamTypesDict[tmp]

		/* #8-x-2 条件が以上か以下か */
		DOM_Text.textContent = messages[language][23].replace("{i}", b + 1);
		DOM_Input_Select.options.length = 0;
		DOM_Input_Select.options.add(new Option(messages[language][24], "1"));
		DOM_Input_Select.options.add(new Option(messages[language][25], "2"));

		/* #8-x-2の処理 */
		DOM_NextButton.disabled = false;
		await eventPromisify(DOM_NextButton, "click");
		tmp = clamp(1, parseInt(DOM_Input_Select.value), 2)
		exams[e].Parts[0].examRange = ExamRangeDict[tmp]
		for (f = 0; f <= songCount - 1; f++) {
			DOM_NextButton.disabled = true;
			DOM_Input_Text.classList.remove("hidden");
			DOM_Input_File.classList.add("hidden");
			DOM_Input_Select.classList.add("hidden");
			DOM_Input_Text.type = "number";
			DOM_Input_Text.min = 0;
			DOM_Input_Text.max = 999999;
			DOM_Input_Text.value = "";
			DOM_Text.textContent = messages[language][29].replace("{i}", charts[f].title).replace("{j}", e);

			/* #8-x-3-1の処理 */
			workId = 6;
			DOM_Input_Text.addEventListener("change", Input_Text_Event);
			await eventPromisify(DOM_NextButton, "click");
			exams[e].Parts[f].redPass = clamp(0, parseInt(DOM_Input_Text.value), 999999);
			DOM_Input_Text.removeEventListener("change", Input_Text_Event);
			if (exams[e].Parts[0].examRange == "m") {
				DOM_NextButton.disabled = true;
				DOM_Input_Text.classList.remove("hidden");
				DOM_Input_File.classList.add("hidden");
				DOM_Input_Select.classList.add("hidden");
				DOM_Input_Text.type = "number";
				DOM_Input_Text.min = exams[e].Parts[f].redPass;
				DOM_Input_Text.max = 999999;
				DOM_Input_Text.value = "";
				DOM_Text.textContent = messages[language][30].replace("{i}", charts[f].title).replace("{j}", e).replace("{k}", exams[e].Parts[f].redPass).replace("{l}", 999999);

				/* #8-x-3-2の処理 */
				workId = 7;
				tmpArr = [exams[e].Parts[f].redPass, 999999]
				DOM_Input_Text.addEventListener("change", Input_Text_Event);
				await eventPromisify(DOM_NextButton, "click");
				exams[e].Parts[f].goldPass = clamp(exams[e].Parts[f].redPass, parseInt(DOM_Input_Text.value), 999999);
				DOM_Input_Text.removeEventListener("change", Input_Text_Event);
			} else {
				DOM_NextButton.disabled = true;
				DOM_Input_Text.classList.remove("hidden");
				DOM_Input_File.classList.add("hidden");
				DOM_Input_Select.classList.add("hidden");
				DOM_Input_Text.type = "number";
				DOM_Input_Text.min = 0;
				DOM_Input_Text.max = exams[e].Parts[f].redPass;
				DOM_Input_Text.value = "";
				DOM_Text.textContent = messages[language][30].replace("{i}", charts[f].title).replace("{j}", f).replace("{k}", e).replace("{l}", exams[e].Parts[f].redPass);

				/* #8-x-3-2の処理 */
				workId = 7;
				tmpArr = [0, exams[e].Parts[f].redPass]
				DOM_Input_Text.addEventListener("change", Input_Text_Event);
				await eventPromisify(DOM_NextButton, "click");
				exams[e].Parts[f].goldPass = clamp(0, parseInt(DOM_Input_Text.value), exams[e].Parts[f].redPass);
				DOM_Input_Text.removeEventListener("change", Input_Text_Event);
			}
		}
	}

	document.getElementById("3").classList.remove("bg-green-400","text-white");
	document.getElementById("3").classList.add("border","border-green-400","bg-white","text-green-400");
	document.getElementById("4").classList.remove("border","border-green-400","bg-white","text-green-400");
	document.getElementById("4").classList.add("bg-green-400","text-white")
	/* #9 DANTICK */
	DOM_NextButton.disabled = true;
	DOM_Input_Text.placeholder = "";
	DOM_Text.textContent = messages[language][31];
	DOM_Input_Text.classList.remove("hidden");
	DOM_Input_File.classList.add("hidden");
	DOM_Input_Select.classList.add("hidden");
	DOM_Input_Text.value = "";
	DOM_Input_Text.type = "number";
	DOM_Input_Text.min = 0;
	DOM_Input_Text.max = 5;
	workId = 8;
	DOM_Input_Text.addEventListener("change", Input_Text_Event);
	await eventPromisify(DOM_NextButton, "click");
	danTick = clamp(0, parseInt(DOM_Input_Text.value, 5));

	/* #10 DANTICKCOLOR */
	DOM_Text.textContent = messages[language][32];
	DOM_NextButton.disabled = false;
	DOM_Input_Text.placeholder = "e.g.)#ffffff"
	DOM_Input_Text.type = "text";
	DOM_Input_Text.value = "#ffffff";
	workId = 9;
	DOM_Input_Text.addEventListener("change", Input_Text_Event);
	await eventPromisify(DOM_NextButton, "click");
	danColor = DOM_Input_Text.value;
	if (danColor == "") { danColor = "#ffffff" }

	/* header */
	balloons = "BALLOON:";
	balloonsContent = "";
	chart.push(`TITLE:${chartName}`);
	chart.push(`BPM:${charts[0].bpm}`);
	chart.push(`WAVE:${charts[0].wave}`);
	chart.push(`DEMOSTART:${charts[0].demoStart}`);
	chart.push(`SCOREMODE:2`);
	chart.push(`COURSE:Dan`);
	chart.push(`LEVEL:10`);
	for (g = 0; g <= songCount - 1; g++) {
		if (balloonsContent != "" && charts[g].difficulties[difficulties[g] - 1].balloon != "") {
			balloonsContent += "," + charts[g].difficulties[difficulties[g] - 1].balloon;
		} else {
			balloonsContent += charts[g].difficulties[difficulties[g] - 1].balloon;
		}
	}
	chart.push(balloons + balloonsContent);
	for (gid of globalIndexes) {
		chart.push(`EXAM${gid + 1}:${exams[gid].Parts[0].examType},${exams[gid].Parts[0].redPass},${exams[gid].Parts[0].goldPass},${exams[gid].Parts[0].examRange}`)
	}
	chart.push(`DANTICK:${danTick}`)
	chart.push(`DANTICKCOLOR:${danColor}`)

	/* process charts */
	chart.push(`#START`)
	for (h = 0; h <= songCount - 1; h++) {
		chart.push(`#NEXTSONG ${charts[h].title},${charts[h].subtitle},,${charts[h].wave},350,80,${charts[h].difficulties[difficulties[h] - 1].starRating},${difficulties[h] - 1}`)
		chart.push(`#BPMCHANGE ${charts[h].bpm}`)
		chart.push("#MEASURE 4/4")
		chart.push("#SCROLL 1.0")
		chart.push("#BARLINEON")
		chart.push(`#DELAY ${charts[h].offset}`)
		/* Individual exams */
		for (ngid of nonGlobalIndexes) {
			chart.push(`EXAM${ngid + 1}:${exams[ngid].Parts[0].examType},${exams[ngid].Parts[h].redPass},${exams[ngid].Parts[h].goldPass},${exams[ngid].Parts[0].examRange}`)
		}
		chart.push(charts[h].difficulties[difficulties[h] - 1].body)
		chart.push(",")
	}
	chart.push(`#END`)
	
	console.log(chart.join("\n"))

	DOM_Text.textContent=""
	DOM_Input_Text.classList.add("hidden");
	DOM_Input_File.classList.add("hidden");
	DOM_Input_Select.classList.add("hidden");
	DOM_NextButton.classList.add("hidden")
	document.querySelector("textarea").classList.remove("hidden");
	document.querySelector("textarea").textContent=chart.join("\n");
}

function Input_Text_Event() {
	if (DOM_Input_Text.value != "") {
		if (workId == 1) {
			if (parseInt(DOM_Input_Text.value) > 0 && parseInt(DOM_Input_Text.value) < 10) {
				DOM_NextButton.disabled = false;
			} else {
				DOM_NextButton.disabled = true;
			}
		} else if (workId == 2) {
			if (parseInt(DOM_Input_Text.value) > 0 && parseInt(DOM_Input_Text.value) < 8) {
				DOM_NextButton.disabled = false;
			} else {
				DOM_NextButton.disabled = true;
			}
		} else if (workId == 3) {
			if (DOM_Input_Text.value.length != 0) {
				DOM_NextButton.disabled = false;
			} else {
				DOM_NextButton.disabled = true;
			}
		} else if (workId == 4) {
			if (parseInt(DOM_Input_Text.value) > -1 && parseInt(DOM_Input_Text.value) < 101) {
				DOM_NextButton.disabled = false;
			} else {
				DOM_NextButton.disabled = true;
			}
		} else if (workId == 5) {
			if (parseInt(DOM_Input_Text.value) > exams[0].Parts[0].redPass - 1 && parseInt(DOM_Input_Text.value) < 101) {
				DOM_NextButton.disabled = false;
			} else {
				DOM_NextButton.disabled = true;
			}
		} else if (workId == 6) {
			if (parseInt(DOM_Input_Text.value) > -1 && parseInt(DOM_Input_Text.value) < 1000000) {
				DOM_NextButton.disabled = false;
			} else {
				DOM_NextButton.disabled = true;
			}
		} else if (workId == 7) {
			if (parseInt(DOM_Input_Text.value) > tmpArr[0] - 1 && parseInt(DOM_Input_Text.value) < tmpArr[1] + 1) {
				DOM_NextButton.disabled = false;
			} else {
				DOM_NextButton.disabled = true;
			}
		} else if (workId == 8) {
			if (parseInt(DOM_Input_Text.value) > -1 && parseInt(DOM_Input_Text.value) < 9) {
				DOM_NextButton.disabled = false;
			} else {
				DOM_NextButton.disabled = true;
			}
		} else if (workId == 9) {
			if (DOM_Input_Text.value.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/) != null || DOM_Input_Text.value == "") {
				DOM_NextButton.disabled = false;
			} else {
				DOM_NextButton.disabled = true;
			}
		}
	} else {
		DOM_NextButton.disabled = true;
	}
}

function Input_File_Event(e) {
	if (e.target.files[0] == undefined) {
		DOM_NextButton.disabled = true;
	} else {
		DOM_NextButton.disabled = false;
	}
}

function Chart(content) {
	this.raw = content;
	this.difficulties = [null, null, null, null, null];
	this.title = "";
	this.subtitle = "";
	this.demoStart = 0;
	this.bpm = 140;
	this.wave = "";
	this.offset = "";

	/* 処理 */
	//General split
	let matchlist = this.raw.match(/(?:^TITLE:|^COURSE:)(?:.|\n(?!COURSE))*/gmi);

	//Header extraction
	let header = matchlist.shift();

	//Title
	this.title = !!header.match(/^TITLE:(.*)/gmi) ? header.match(/^TITLE:(.*)/gmi)[0].replace("TITLE:", "").trim() : "";

	//Demo start
	this.demoStart = !!header.match(/^DEMOSTART:(\S+)/gmi) ? header.match(/^DEMOSTART:(\S+)/gmi)[0].replace("DEMOSTART:", "").trim() : 0;

	//Bpm
	console.log(header)
	this.bpm = !!header.match(/^BPM:(\S+)/gmi) ? header.match(/^BPM:(\S+)/gmi)[0].replace("BPM:", "").trim() : 140;

	//Wave
	this.wave = !!header.match(/^WAVE:(.*)/gmi) ? header.match(/^WAVE:(.*)/gmi)[0].replace("WAVE:", "").trim() : "";

	//Offset
	this.offset = !!header.match(/^OFFSET:(\S+)/gmi) ? header.match(/^OFFSET:(\S+)/gmi)[0].toLowerCase().replace("offset:", "").trim()*-1 : "";

	//Subtitle
	this.subtitle = !!header.match(/^SUBTITLE:--(.*)/gmi) ? header.match(/^SUBTITLE:--(.*)/gmi)[0].replace("SUBTITLE:--", "").trim() : "";

	//Extract difficulties
	for (e of matchlist) {
		var diff = DifficultyDict[e.match(/^COURSE:(\S+)/gmi)[0].replace("COURSE:", "").trim()]
		this.difficulties[parseInt(diff)] = new Difficulty(e)
	}
}

function Difficulty(content) {
	this.body = "";
	this.starRating = 10;
	this.balloon = "";

	//Star Rating
	this.starRating = !!content.match(/^LEVEL:(\S+)/gmi)[0] ? content.match(/^LEVEL:(\S+)/gmi)[0].toLowerCase().replace("level:", "").trim() : 10;

	//Balloon
	let bmatch = content.match(/^BALLOON:(\S+)/gmi);
	this.balloon = "";
	if (bmatch.length > 0) {
		this.balloon = content.match(/^BALLOON:(\S+)/gmi)[0].toLowerCase().replace("balloon:", "").trim();
	}

	this.body = content.match(/^#START((?:.|\n(?!#END))*)/gmi)[0].replace("#START", "").replace("#END", "")
}

function Exam(config, songC) {
	this.configuration = config;
	this.Parts = [];
	for (i = 0; i <= songC - 1; i++) {
		this.Parts.push(new ExamPart())
	}
}

function ExamPart() {
	this.examType = "g";
	this.redPass = 0;
	this.goldPass = 0;
	this.examRange = "m";
}

var hover = false
document.querySelector("textarea").addEventListener("mouseover",function(){
	document.querySelector("textarea").select()
	hover=true
})

document.querySelector("textarea").addEventListener("mouseleave",function(){
	if (window.getSelection) {window.getSelection().removeAllRanges();}
 	else if (document.selection) {document.selection.empty();}
	hover=false
})

document.querySelector("textarea").addEventListener("click",function(){
	if(hover==true){
		navigator.clipboard.writeText(document.querySelector("textarea").textContent)
	}
})