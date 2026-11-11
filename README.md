# GIF Mosaic — GitHub Pages

정적 사이트입니다. Python, Node.js, 서버 설치가 필요 없습니다.

## 배포

1. GitHub에서 새 공개 저장소를 만듭니다.
2. 이 폴더 **안의 파일과 `assets` 폴더**를 저장소 최상위에 업로드합니다. (`index.html`이 루트에 있어야 합니다.)
3. Settings → Pages → Build and deployment → Deploy from a branch → `main` / `(root)` → Save.
4. 잠시 후 `https://사용자명.github.io/저장소명/`에서 접속합니다.

## 참고

- 브라우저에서 `index.html`을 파일로 직접 여는 `file://` 방식은 `fetch('palette.json')`에 대한 보안 제한 때문에 동작하지 않을 수 있습니다. GitHub Pages에서는 정상 동작합니다.
- YouTube 영상 프레임은 브라우저 보안 제한으로 읽을 수 없어 썸네일 모자이크만 제공됩니다. 영상 파일 업로드는 프레임별 실시간 모자이크를 지원합니다.
- YouTube 자동재생은 브라우저 정책에 따라 사용자 클릭이 필요할 수 있습니다.
