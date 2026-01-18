    const ADMIN_TOKEN = 'ba10cc7b9ba5b27317d546824a01203d89c0ea3e0972fab50cb786ab5a702dff';

    (async () => {
        getList();
    })();

    /*------------------------------------
        파일 목록 조회
    ------------------------------------*/
    async function getList(){
        const response = await fetch('https://todayaudio.writer1370.workers.dev/api/list', {
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
    }

    /*------------------------------------
        파일 목록 생성
    ------------------------------------*/
    function makeList(audioList){
   const list = document.getElementById('list');
       list.innerHTML = ''; // 기존 목록 초기화 (선택 사항)

       for(let audioData of audioList) {
         const div = document.createElement('div');
         div.className = 'audio-card';
         div.id = `${audioData.id}`;

         // 클래스명을 추가하여 CSS가 적용되도록 수정
         div.innerHTML = `
           <span class="title">${audioData.title}</span>
           <span class="desc">${audioData.description}</span>
         `;

         div.addEventListener('click', function(event) {
             loadAndPlayAudio(this, `${audioData.id}`);
         });

         list.appendChild(div);
       }
    }

async function loadAndPlayAudio($this, id) {
    try {
        // 1. 이미 열려있는 플레이어가 있는지 확인
        const existingPlayer = $this.querySelector('.audio-player-container');

        if (existingPlayer) {
            // [토글 로직] 이미 있으면 삭제하고 함수 종료 (닫기)
            existingPlayer.remove();
            return;
        }

        // 2. 다른 카드에 열려있는 플레이어들이 있다면 모두 닫고 싶을 때 (선택 사항)
        // document.querySelectorAll('.audio-player-container').forEach(el => el.remove());

        // 3. 플레이어가 없으면 새로 생성 (열기)
        const audioBlob = await fetchAudioData(id);
        createAudioPlayer(id, audioBlob);

    } catch (err) {
        console.error('오디오 로드 중 에러 발생:', err.message);
        alert('오디오 파일을 불러오지 못했습니다. 다시 시도해 주세요.');
    }
}
    async function fetchAudioData(id) {
        const BASE_URL = 'https://todayaudio.writer1370.workers.dev/api/file';
        const response = await fetch(`${BASE_URL}?id=${id}`);

        if (!response.ok) {
            throw new Error(`파일을 가져오는데 실패했습니다 : ${response.status}`);
        }

        return await response.blob();
    }

    /**
     * 오디오 플레이어를 생성하고 DOM에 배치합니다.
     */
    function createAudioPlayer(id, audioBlob) {
        const target = document.getElementById(id);
        if (!target) {
            return console.error(`ID가 ${id}인 요소를 찾을 수 없습니다.`);
        }

        // 1. 임시 URL 생성
        const audioUrl = URL.createObjectURL(audioBlob);

        // 2. DOM 요소 생성 (innerHTML 대신 createElement 권장)
        const container = document.createElement('div');
        container.className = 'audio-player-container';

        container.innerHTML = `
            <div class="audio-controls">
                <audio controls playsinline preload="metadata"></audio>
                <a href="${audioUrl}" download="${id}.mp3" class="download-link">⬇️ 다운로드</a>
            </div>
        `;

        const audio = container.querySelector('audio');
        audio.src = audioUrl;

        // 3. 오디오 상태 관리 및 재생 로직
        audio.addEventListener('play', async () => {
            // 브라우저 정책 대응: AudioContext는 사용자 상호작용 후 재개되어야 함
            // (현재 코드에서 Context를 사용하지 않는다면 이 부분은 생략 가능합니다)

            if (audio.readyState <= 1) { // HAVE_NOTHING(0) 또는 HAVE_METADATA(1)
                console.log('오디오 세션 리프레시 중...');
                audio.load(); // src를 다시 할당하는 대신 load()로 충분한 경우가 많습니다.

                // 필요 시 약간의 지연 후 재생
                try {
                    await new Promise(resolve => setTimeout(resolve, 200));
                    await audio.play();
                } catch (e) {
                    console.warn('자동 재생이 차단되었습니다.');
                }
            }
        });

        // 4. [중요] 메모리 누수 방지: 요소가 제거될 때 URL 해제
        // 이 처리를 하지 않으면 페이지를 이동하기 전까지 메모리에 계속 남습니다.
        const observer = new MutationObserver((mutations) => {
            if (!document.body.contains(container)) {
                URL.revokeObjectURL(audioUrl);
                observer.disconnect();
                console.log(`Resource revoked for ${id}`);
            }
        });
        observer.observe(target.parentNode || document.body, { childList: true });

        target.appendChild(container);
    }

    /*------------------------------------
        파일 업로드
    ------------------------------------*/
    async function regist(){

        // 1. 입력 요소 참조
        const titleInput = document.getElementById('title');
        const descInput = document.getElementById('desc');
        const fileInput = document.getElementById('fileInput');
        const fileNameSpan = document.getElementById('fileName');

        let data = {
            title: titleInput.value,
            description: descInput.value
        };

        // 2. 유효성 검사
        if (!data.title || data.title.trim() === "") {
            alert("제목을 입력하세요");
            return;
        }

        if (!fileInput.files[0]) {
            alert("파일을 업로드하세요");
            return;
        }

        // 3. FormData 생성
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        formData.append('fileData', JSON.stringify(data));

        try {
            const response = await fetch('https://todayaudio.writer1370.workers.dev/api/upload', {
                method: 'POST',
                headers: {'Authorization': `Bearer ${ADMIN_TOKEN}`},
                body: formData
            });
            if(response.status === 200) {
                alert("등록되었습니다! 🐝");
               // [추가된 로직] 입력창 클리어
               titleInput.value = "";       // 제목 비우기
               descInput.value = "";        // 설명 비우기
               fileInput.value = "";        // 파일 선택 해제 (실제 input)
               fileNameSpan.textContent = "선택된 파일 없음"; // 화면에 표시되는 파일명 초기화
                // 목록 재조회
                getList();
            }
        } catch (error) {
            alert("오류가 발생했습니다. 관리자에게 문의하세요.");
        }
    }