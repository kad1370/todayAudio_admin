const ADMIN_TOKEN = 'ba10cc7b9ba5b27317d546824a01203d89c0ea3e0972fab50cb786ab5a702dff';

(async () => {
    const cacheNames = await caches.keys(); // 존재하는 모든 캐시 이름 가져오기
    await Promise.all(
      cacheNames.map(name => caches.delete(name))
    );

    window.localStorage.clear();
    getList();
})();

/*------------------------------------
    파일 목록 조회
------------------------------------*/
async function getList(){
    let response;
    try{
        response = await fetch('https://todayaudio.writer1370.workers.dev/api/list', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${ADMIN_TOKEN}`
            }
          });
          if(response.status === 200) {
              const data = await response.json();
              let audioList = data.audioList;
      
              if(audioList.length > 0) {
                  // [추가된 로직] 최신순으로 정렬 (배열 순서 뒤집기)
                  audioList.reverse();
      
                  // 기존 목록을 비우고 새로 그리기 위해 list 초기화 추가
                  document.getElementById('list').innerHTML = '';
                  makeList(audioList);
              }
          }
    } catch(e){
        if (navigator.onLine == false){
            alert("네트워크 연결을 확인해주세요!");
        } 
    }

}

/*------------------------------------
    파일 목록 생성
------------------------------------*/
function makeList(audioList){

   const list = document.getElementById('list');
   list.innerHTML = ''; // 기존 목록 초기화 (선택 사항)

   for(let audioData of audioList) {
     const div = document.createElement('div');
     let id = `${audioData.id}`;
     div.className = 'audio-card';
     div.id = id;
     let date = `${id.substring(0,4)}.${id.substring(4,6)}.${id.substring(6,8)}`;
     
     // 클래스명을 추가하여 CSS가 적용되도록 수정
     div.innerHTML = `
        <div class="date">${date}</div>
        <div class="title">${audioData.title}</div>
        <div class="desc">${audioData.description}</div>
     `;

     div.addEventListener('click', function(event) {
        loadDetailPage(this,`${audioData.id}`);
     });

     list.appendChild(div);
   }
}

function loadDetailPage($this,id){
    let obj = {
        title : $this.children[1].textContent,
        desc : $this.children[2].textContent
    }

    if(window.localStorage.getItem(id) === null) {
        window.localStorage.setItem(id,JSON.stringify(obj));
    }
    window.location.href = "detail.html?id="+id; 
}

function loadRegistPage(){
    window.location.href = "regist.html"; 
}
/*
async function loadAndPlayAudio($this, id) {
    try {
        const cache = await caches.open('audio-cache');
        const cachedResponse = await cache.match(id);
        if (!cachedResponse) {
            const BASE_URL = 'https://todayaudio.writer1370.workers.dev/api/file';
            const response = await fetch(`${BASE_URL}?id=${id}`);
            if (!response.ok) {
                throw new Error(`파일을 가져오는데 실패했습니다 : ${response.status}`);
            }
            let obj = {
                title : $this.children[0].textContent,
                desc : $this.children[1].textContent
            }

            if(window.localStorage.getItem(id) === null) {
                window.localStorage.setItem(id,JSON.stringify(obj));
            }
            await cache.put(id, response.clone());

        }
    } catch (err) {
        console.error(err);
        alert("오류가 발생했습니다.");
        return;
    }

    //window.location.href = "detail.html?id="+id;
}
*/
