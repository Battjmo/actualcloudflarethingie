document.querySelector('body').onload = async function () {
	const response = await fetch('/api/visualNovelText', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ word: '' }),
	});

	const list = document.getElementById('definition');
	let textForImage = '';
	const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
	while (true) {
		const { value, done } = await reader.read();
		if (done) {
			console.log('Stream done');
			break;
		}
		definition.innerText += value;
		textForImage += value;
	}
	const imageResponse = await fetch('/api/visualNovelImage', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ text: textForImage }),
	});
	console.log('🚀 ~ imageResponse:', imageResponse);
	const resultSection = document.getElementById('resultSection');
	const image = document.getElementById('blah');
	const imageURL = URL.createObjectURL(await imageResponse.blob());
	image.src = imageURL;
	resultSection.style.display = 'block';
};

document.getElementById('searchButton').addEventListener('click', async function () {
	const word = document.getElementById('wordInput').value;
	const resultSection = document.getElementById('resultSection');
	const definition = document.getElementById('definition');

	if (word.trim() === '') {
		alert('Please enter a word');
		return;
	}

	const response = await fetch('/api/visualNovelText', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ word }),
	});
	const list = document.getElementById('definition');
	list.innerText = '';
	console.log(response);
	const reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
	let textForImage = '';
	while (true) {
		const { value, done } = await reader.read();
		if (done) {
			console.log('Stream done');
			break;
		}
		definition.innerText += value;
		textforImage += value;
	}

	const imageResponse = await fetch('/api/visualNovelImage', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ text: textForImage }),
	});
	console.log('🚀 ~ imageResponse:', imageResponse);

	const image = document.getElementById('blah');
	const imageURL = URL.createObjectURL(await imageResponse.blob());
	image.src = imageURL;

	resultSection.style.display = 'block';
});
