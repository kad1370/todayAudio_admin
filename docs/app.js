fetch('./audios.json')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('list');

    data.forEach(audio => {
      const div = document.createElement('div');
      div.className = 'audio-card';
      div.innerHTML = `
        <h3>${audio.title}</h3>
        <p>${audio.desc}</p>
        <audio controls src="${audio.url}"></audio>
        <a href="${audio.url}" download>⬇️ 다운로드</a>
      `;

      list.appendChild(div);
    });
  });
