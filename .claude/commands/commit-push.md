# 커밋 & 푸시 (버전 자동 업데이트)

변경사항을 커밋하고 푸시합니다. 버전 업 유형을 인자로 받습니다.

## 인자
- `$ARGUMENTS`: 버전 업 유형 (patch | minor | major) — 기본값: patch

## 실행 절차

### 1. 현재 상태 확인
- `git status`로 변경사항 확인
- 변경사항이 없으면 "커밋할 변경사항이 없어"라고 알리고 중단

### 2. 버전 업데이트
- `package.json`의 `version` 필드를 인자에 따라 올리기:
  - `patch`: 1.1.2 → 1.1.3
  - `minor`: 1.1.2 → 1.2.0
  - `major`: 1.1.2 → 2.0.0
- `public/ai.json`의 `version` 필드도 동일하게 동기화

### 3. 커밋 메시지 작성
- `git diff`로 변경 내용 분석
- 변경 내용에 맞는 커밋 메시지 자동 생성
- 버전 업 정보 포함 (예: `v1.1.3`)
- Co-Authored-By 포함

### 4. 커밋 & 푸시
- 변경된 파일들 staging
- 커밋 실행
- `git push` 실행

### 5. 결과 보고
- 새 버전 번호
- 커밋 해시
- 푸시 결과

## 주의사항
- GitHub Actions에 `notify-publish.yml` 워크플로우가 있어서, package.json 버전이 변경되면 자동으로 npm 배포 + Slack 알림이 실행됨
- 버전을 올리지 않고 커밋만 하고 싶으면 일반 git 명령어를 사용할 것
