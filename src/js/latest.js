/* COLORTEM VERSION 1.0 */

const encode = (str, version, charset) => {
	let versionCode = "0100";
	switch (charset) {
		case "1.0":
			charsetCode = "0100";
			break;
	}

	let charsetCode = "00";
	let startingBase = 39;
	let sub = "5a0";
	switch (charset) {
		case "Basic":
			charsetCode = "00";
			startingBase = 39;
			sub = "5a0";
			break;
		case "Basic Extended":
			charsetCode = "01";
			startingBase = 45;
			sub = "678";
			break;
	}

	pixels = chunkArr(chunkStr(str.toLowerCase(), 2, sub, true).map(chunk => {
		let converted = convert(chunk, startingBase, 16);
		while (converted.length !== 3) {
			converted = "0" + converted;
		}
		return converted;
	}), 2);

	pixels.unshift(String(versionCode) + String(charsetCode));

	let rate = 10;
	if (pixels.length < 10) rate = 40;
	else if (pixels.length < 30) rate = 30;
	else if (pixels.length < 60) rate = 20;
	else if (pixels.length < 100) rate = 10;
	else rate = 5;

	const canvas1 = document.createElement("canvas");
	canvas1.width = pixels.length;
	canvas1.height = 1;
	const ctx1 = canvas1.getContext("2d");

	const canvas2 = document.getElementById("preview");
	canvas2.width = pixels.length * rate;
	canvas2.height = rate;
	const ctx2 = canvas2.getContext("2d");

	pixels.forEach((rgb, i) => {
		ctx1.fillStyle = `#${rgb}`;
		ctx1.fillRect(i, 0, 1, 1);
		ctx2.fillStyle = `#${rgb}`;
		ctx2.fillRect(i * rate, 0, rate, rate);
	});

	linkDownload(canvas1, "colortem_result");
	document.getElementById("previewBtn").className = "activated";
	canvas2.className = "activated";
};

const decode = input => {
	const file = input.files[0];
	const fr = new FileReader();
	fr.onload = () => {
		img = new Image();
		img.onload = () => {
			const canvas = document.createElement("canvas");
			canvas.width = img.width;
			canvas.height = img.height;
			const ctx = canvas.getContext("2d");
			ctx.drawImage(img, 0, 0);

			let version = "1.0";
			let charset = "Basic";
			const outputArr = [];
			chunkArr(ctx.getImageData(0, 0, canvas.width, 1).data, 4, "", false).forEach((rgba, i) => {
				rgb = [];
				rgba.slice(0, 3).forEach((val, j) => {
					rgb[j] = val.toString(16);
					if (rgb[j].length === 1) rgb[j] = "0" + rgb[j];
				});
				rgb = rgb.join("");

				if (i === 0) {
					version = parseInt(rgb.slice(0, 2), 16) + "." + parseInt(rgb.slice(2, 4), 16);
					switch (rgb.slice(4, 6)) {
						case "00":
							charset = "Basic";
							break;
						case "01":
							charset = "Basic Extended";
							break;
						default:
							charset = "error";
							break;
					}
				} else {
					if (charset === "error" || !version.match(/^1\.0$/)) return;
					switch (version) {
						case "1.0":
							let a = rgb.slice(0, 3);
							let b = rgb.slice(3, 6);
							outputArr.push(a);
							outputArr.push(b);
							break;
					}
				}
			});

			if (charset === "error" || !version.match(/^1\.0$/)) {
				document.getElementById("output").innerHTML = "ERROR: this is not a valid Colortem string.";
				return;
			}

			let outputStr = "";
			switch (charset) {
				case "Basic":
					outputArr.forEach(chunk => {
						outputStr += convert(chunk, 16, 39);
					});
					break;
				case "Basic Extended":
					outputArr.forEach(chunk => {
						outputStr += convert(chunk, 16, 45).replace(/\n/g, "<br>");
					});
					break;
			}

			document.getElementById("output").innerHTML = `SUCCESS | using version ${version} charset ${charset} | OUTPUT:<br>` + outputStr;
		};
		img.src = fr.result;
	};
	fr.readAsDataURL(file);
};
