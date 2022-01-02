const chunkStr = (str, size) => {
	str += " ".repeat(size - (str.length % size) === size ? 0 : size - (str.length % size));

	const numChunks = Math.ceil(str.length / size);
	const chunks = new Array(numChunks);

	for (let i = 0, o = 0; i < numChunks; ++i, o += size) {
		chunks[i] = str.substr(o, size);
	}

	return chunks;
};

const chunkArr = (arr, size, sub, stringify = true) => {
	while (arr.length % size !== 0) {
		arr.push(sub);
	} 

	const res = [];
	
    for (let i = 0; i < arr.length; i += size) {
        let chunk = arr.slice(i, i + size);
		if (stringify) chunk = chunk.join("");
        res.push(chunk);
    }

    return res;
};

const convert = (value, fromBase, toBase) => {
	const charset = '0123456789abcdefghijklmnopqrstuvwxyz ,.\'’\n!?;ABCDEFGHIJKLMNOPQRSTUVWXYZ:/-+*=%$#@&^‘"“”()[]{}|\\<>~`'.split('');
	const from_range = charset.slice(0, fromBase);
	const to_range = charset.slice(0, toBase);
	
	let dec_value = value.split('').reverse().reduce(function (carry, digit, index) {
		if (from_range.indexOf(digit) === -1) throw new Error('Invalid digit `'+digit+'` for base '+fromBase+'.');
		return carry += from_range.indexOf(digit) * (Math.pow(fromBase, index));
	}, 0);
	
	let new_value = '';
	while (dec_value > 0) {
		new_value = to_range[dec_value % toBase] + new_value;
		dec_value = (dec_value - (dec_value % toBase)) / toBase;
	}

	return new_value || '0';
};

const linkDownload = (canvas, filename) => {
	const link = document.getElementById('download');
	link.innerHTML = "download";
	link.download = `${filename}.png`;
	link.href = canvas.toDataURL("image/png");
};
