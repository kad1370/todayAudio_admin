fetch('./audios.json')
  .then(res => res.json())
  .then(data => {
    const list = document.getElementById('list');

    data.forEach(audio => {
      const li = document.createElement('li');
      div.className = 'audio-card';
      div.innerHTML = `${audio.title}
      `;

      list.appendChild(div);
    });
  });
