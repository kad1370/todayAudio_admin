const ADMIN_TOKEN = 'ba10cc7b9ba5b27317d546824a01203d89c0ea3e0972fab50cb786ab5a702dff';

(async () => {
    resetCache();
    getList();
})();

/*------------------------------------
    캐시 초기화
------------------------------------*/
async function resetCache(){
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = today.getDate();
    const yyyymmdd = yyyy+mm+dd;

    const lastSyncDate = window.localStorage.getItem("lastSyncDate");
    if(lastSyncDate == "") {
        window.localStorage.setItem("lastSyncDate",yyyymmdd);
    } 

    // 하루 지나면 캐시 초기화
    if(lastSyncDate != yyyymmdd) {
        const cacheNames = await caches.keys(); 
        await Promise.all(
          cacheNames.map(name => caches.delete(name))
        );
        window.localStorage.clear();
        window.localStorage.setItem("lastSyncDate",yyyymmdd);
    }
}

/*------------------------------------
    파일 목록 조회
------------------------------------*/
async function getList(){
    let response;
    
    try{
        document.querySelector('.loading-wrapper').classList.add("active");
        document.querySelector('.list-container').classList.add("hide");

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
    } finally {
        document.querySelector('.loading-wrapper').classList.remove("active");
        document.querySelector('.list-container').classList.remove("hide");
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
    window.location.href = "page/detail.html?id="+id; 
}

function loadRegistPage(){
    window.location.href = "page/regist.html"; 
}
