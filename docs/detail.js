const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const id = urlParams.get('id');
const audio = document.querySelector('audio');

(async () => {
    const data = JSON.parse(window.localStorage.getItem(id));

    // 2. 화면 데이터 매핑
    document.querySelector('[name="title"]').textContent = data.title;
    document.querySelector('[name="desc"]').textContent = data.desc;

    if (id) {
        loadAndPlayAudio(id);
    } else {
        alert("잘못된 접근입니다.");
        history.back();
    }
})();

async function loadAndPlayAudio(id) {
    try {
        const cache = await caches.open('audio-cache');
        const cachedResponse = await cache.match(id);
        if (!cachedResponse) {
            document.querySelector('.loading-wrapper').style.display = 'block';
            document.querySelector('.player-container').style.display = 'none';
            document.querySelector('.bookmark-container').style.display = 'none';
            
            const BASE_URL = 'https://todayaudio.writer1370.workers.dev/api/file';
            const response = await fetch(`${BASE_URL}?id=${id}`);
            if (!response.ok) {
                throw new Error(`파일을 가져오는데 실패했습니다 : ${response.status}`);
            }

            await cache.put(id, response.clone());
        }
        createAudioPlayer(id);
    } catch (err) {
        console.error(err);
        alert("오류가 발생했습니다.");
        return;
    } finally {
        document.querySelector('.loading-wrapper').style.display = 'none';
        document.querySelector('.player-container').style.display = 'block';
        document.querySelector('.bookmark-container').style.display = 'block';
    }
}  

async function createAudioPlayer(id) {
    try {
        // 1. 데이터 및 캐시 로드
        const cache = await caches.open('audio-cache');
        const cachedResponse = await cache.match(id);
        
        if (!cachedResponse) {
            alert("오디오 파일을 찾을 수 없습니다.");
            return;
        }
        const audioBlob = await cachedResponse.blob();

        // 3. 오디오 URL 생성 및 설정
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const addBtn = document.getElementById('addBtn');
        audio.src = audioUrl;

        /*
        const downloadBtn = document.getElementById('downloadBtn');
        
        // 5. 다운로드 버튼 클릭 이벤트
        downloadBtn.onclick = () => {
            const a = document.createElement('a');
            a.href = audioUrl;
            a.download = `${data.title || id}.mp3`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        };
        
        // 6. 메모리 관리: 페이지를 떠날 때 ObjectURL 해제
        window.addEventListener('unload', () => {
            URL.revokeObjectURL(audioUrl);
        });
        */    
    } catch (error) {
        console.error("오디오 플레이어 생성 실패:", error);
        alert("오디오를 불러오는 중 오류가 발생했습니다.");
    }
}

function addTime(){
    let currentTime = formatTime(document.querySelector('audio').currentTime);
    // 현재 재생 시간 가져오기 (초 단위)
    const target = document.getElementById('bookmarkList');

    // 2. DOM 요소 생성 (innerHTML 대신 createElement 권장)
    const row = document.createElement('div');
    row.className = 'bookmark-row';
    
    // 시간 버튼 (클릭 시 이동)
    const btn = document.createElement('button');
    btn.className = 'time-tag';
    btn.textContent = currentTime;
    btn.onclick = () => {
        audio.currentTime = timeToSeconds(currentTime);
        audio.play();
    };

    // 메모 입력창
    const input = document.createElement('input');
    input.className = 'memo-input';
    input.placeholder = '여기에 메모를 입력하세요...';
    
    row.appendChild(btn);
    row.appendChild(input);
    target.appendChild(row);
}

function formatTime(seconds){
    const hrs = Math.floor(seconds / 3600);      // 시간 계산
    const min = Math.floor((seconds % 3600) / 60); // 분 계산
    const sec = Math.floor(seconds % 60);        // 초 계산

    // 한 자릿수일 때 앞에 0을 채워주는 함수
    const pad = (num) => String(num).padStart(2, '0');

    if (hrs > 0) {
        // 1시간 이상일 때 (예: 01:05:30)
        return `${pad(hrs)}:${pad(min)}:${pad(sec)}`;
    } else {
        // 1시간 미만일 때 (예: 05:30)
        return `${pad(min)}:${pad(sec)}`;
    }
}

function timeToSeconds(timeStr) {
    const parts = timeStr.split(':').map(Number);
    if (parts.length === 3) { // 시:분:초
        return (parts[0] * 3600) + (parts[1] * 60) + parts[2];
    } else { // 분:초
        return (parts[0] * 60) + parts[1];
    }
};