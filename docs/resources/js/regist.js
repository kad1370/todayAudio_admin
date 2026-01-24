const ADMIN_TOKEN = 'ba10cc7b9ba5b27317d546824a01203d89c0ea3e0972fab50cb786ab5a702dff';

// 1. 입력 요소 참조
const titleInput = document.getElementById('title');
const descInput = document.getElementById('desc');
const fileInput = document.getElementById('fileInput');
const fileNameSpan = document.getElementById('fileName');

(async () => {
    // 파일명 표시 스크립트
    document.getElementById('fileInput').addEventListener('change', function(e) {
        let fileName = "";
        let titleText = "";
        if(e.target.files[0]) {
            fileName = e.target.files[0].name;
            titleText = fileName.substring(0,fileName.length-4); // 확장자 제거
        } else {
            fileName = "선택된 파일 없음";
            titleText = "";
        }
        fileNameSpan.textContent = fileName;
        titleInput.value = titleText; 
    });  
})();

async function regist(){
    let data = {
        title: titleInput.value,
        description: descInput.value
    };

    // 2. 유효성 검사
    if (!fileInput.files[0]) {
        alert("파일을 업로드하세요");
        return;
    }
    if (!data.title || data.title.trim() === "") {
        alert("제목을 입력하세요");
        return;
    }

    // 3. FormData 생성
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('fileData', JSON.stringify(data));

    try {
        document.querySelector('.loading-wrapper').classList.add("active");
        document.querySelector('.file').classList.add("hide");

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
            //getList();
        }
    } catch (error) {
    alert(error);
        alert("오류가 발생했습니다. 관리자에게 문의하세요.");
    } finally {
        document.querySelector('.loading-wrapper').classList.remove("active");
        document.querySelector('.file').classList.remove("hide");
    }
}