/** Localized package error messages, keyed "error.<code>". en mirrors the
 *  exact English thrown/issue text; ko is the Korean translation. */
export const errorsEn = {
  // @podo/edit-core — spec-editing.ts
  "error.editCore.tokenDocNotFound": 'Token document "{index}" was not found.',
  "error.editCore.tokenExtObject": "Token extensions must be a JSON object.",
  "error.editCore.tokenExtJson": "Token extensions must be valid JSON.",
  "error.editCore.tokenValueRequired": "Token value is required.",
  "error.editCore.tokenValueInvalid":
    "{type} token values must be valid JSON or a valid token alias.",
  "error.editCore.layerExists": 'A layer named "{name}" already exists.',
  "error.editCore.propValuesRequired": "{kind} props require at least one value.",
  "error.editCore.boolDefault": "Boolean defaults must be true or false.",
  "error.editCore.numberDefault": "Number defaults must be numeric.",
  "error.editCore.objectDefault": "Object defaults must be JSON objects.",
  "error.editCore.variantValuesRequired": "Variants require at least one value.",
  "error.editCore.variantDuplicate": 'Duplicate variant value "{value}".',
  "error.editCore.variantDefaultInvalid": 'Default "{value}" is not one of the variant values.',
  "error.editCore.variantNotFound": 'Variant "{name}" was not found.',
  "error.editCore.variantNameRequired": "Variant name is required.",
  "error.editCore.variantExists": 'A variant named "{name}" already exists.',
  "error.editCore.slotNameRequired": "Slot name is required.",
  "error.editCore.tokenPathRequired": "Token path is required.",
  "error.editCore.variantBindingObject": "Variant token bindings must be a JSON object.",
  "error.editCore.tokenPathConflict": 'Token path "{path}" conflicts with existing token "{head}".',
  // @podo/edit-core — store.ts
  "error.editCore.componentNotFound": 'Component "{id}" was not found.',
  // @podo/edit-core — studio-http-adapter.ts
  "error.editCore.studioRequestFailed": "Studio request failed ({status}).",
  "error.editCore.studioValidateFailed": "Studio validate failed ({status}).",
  // @podo/icon-build — svg.ts
  "error.iconBuild.svgNoDom": "normalizeIconSvg requires a DOM environment (DOMParser).",
  "error.iconBuild.svgParse": "The SVG could not be parsed.",
  "error.iconBuild.svgSingle": "The icon must be a single <svg> element.",
  "error.iconBuild.svgNoShapes":
    "The SVG has no drawable shapes (path, rect, circle, ellipse, line, polygon).",
  // editor — figma.ts
  "error.figma.collectionMode": "Figma variable collection must include at least one mode.",
  "error.figma.aliasUnresolved": 'Figma alias "{id}" does not point to an imported variable.',
  "error.figma.tokenPathEmpty": "Token path cannot be empty.",
  "error.figma.pathGroupConflict": 'Figma variable path "{path}" conflicts with a token group.',
  "error.figma.pathTokenConflict": 'Figma variable path "{path}" conflicts with token "{head}".',
  // editor — icons-model.ts
  "error.icons.noFreeCodepoints": "No free Private Use Area codepoints remain for a new icon.",
  // @podo/spec — tokens.ts (zod issues)
  "error.spec.aliasFormat": "Alias references must use {token.path} format.",
  "error.spec.colorValue": "Color tokens must use a color value or alias reference.",
  "error.spec.unitValue": "{type} tokens must use an allowed unit or alias reference.",
  "error.spec.typographyInclude":
    "Typography tokens must include fontFamily, fontSize, lineHeight, fontWeight, letterSpacing, and optional paragraphSpacing.",
  "error.spec.shadowInclude": "Shadow tokens must include x, y, blur, optional spread, and color.",
  "error.spec.cubicBezier": "Cubic bezier tokens must be an array of four numbers between 0 and 1.",
  "error.spec.borderInclude": "Border tokens must include color, width, and style.",
  "error.spec.motionInclude": "Motion tokens must include duration, easing, and optional delay.",
  "error.spec.numberValue": "Number tokens must use a numeric value or alias reference.",
  "error.spec.fontWeightValue": "Font weight tokens must use a number, string, or alias reference.",
  "error.spec.stringValue": "{type} tokens must use a string value or alias reference.",
  // @podo/spec — components.ts (zod issues)
  "error.spec.variantValueToken":
    'valueTokens key "{value}" is not a declared value of variant "{variant}".',
  "error.spec.anatomyUnique": 'Anatomy part name "{name}" must be unique.',
  "error.spec.anatomySelfParent": 'Anatomy part "{name}" cannot be its own parent.',
  "error.spec.anatomyParentMissing": 'Parent "{parent}" for "{name}" does not exist.',
  "error.spec.anatomyCycle": 'Anatomy hierarchy for "{name}" forms a cycle.',
} as const;

export const errorsKo: Record<keyof typeof errorsEn, string> = {
  // @podo/edit-core — spec-editing.ts
  "error.editCore.tokenDocNotFound": '토큰 문서 "{index}"을(를) 찾을 수 없습니다.',
  "error.editCore.tokenExtObject": "토큰 확장은 JSON 객체여야 합니다.",
  "error.editCore.tokenExtJson": "토큰 확장은 유효한 JSON이어야 합니다.",
  "error.editCore.tokenValueRequired": "토큰 값은 필수입니다.",
  "error.editCore.tokenValueInvalid":
    "{type} 토큰 값은 유효한 JSON이거나 유효한 토큰 별칭이어야 합니다.",
  "error.editCore.layerExists": '"{name}" 이름의 레이어가 이미 존재합니다.',
  "error.editCore.propValuesRequired": "{kind} 속성에는 최소 하나의 값이 필요합니다.",
  "error.editCore.boolDefault": "불리언 기본값은 true 또는 false여야 합니다.",
  "error.editCore.numberDefault": "숫자 기본값은 숫자여야 합니다.",
  "error.editCore.objectDefault": "객체 기본값은 JSON 객체여야 합니다.",
  "error.editCore.variantValuesRequired": "변형에는 최소 하나의 값이 필요합니다.",
  "error.editCore.variantDuplicate": '중복된 변형 값 "{value}"입니다.',
  "error.editCore.variantDefaultInvalid": '기본값 "{value}"은(는) 변형 값 중 하나가 아닙니다.',
  "error.editCore.variantNotFound": '변형 "{name}"을(를) 찾을 수 없습니다.',
  "error.editCore.variantNameRequired": "변형 이름은 필수입니다.",
  "error.editCore.variantExists": '"{name}" 이름의 변형이 이미 존재합니다.',
  "error.editCore.slotNameRequired": "슬롯 이름은 필수입니다.",
  "error.editCore.tokenPathRequired": "토큰 경로는 필수입니다.",
  "error.editCore.variantBindingObject": "변형 토큰 바인딩은 JSON 객체여야 합니다.",
  "error.editCore.tokenPathConflict":
    '토큰 경로 "{path}"이(가) 기존 토큰 "{head}"과(와) 충돌합니다.',
  // @podo/edit-core — store.ts
  "error.editCore.componentNotFound": '컴포넌트 "{id}"을(를) 찾을 수 없습니다.',
  // @podo/edit-core — studio-http-adapter.ts
  "error.editCore.studioRequestFailed": "스튜디오 요청에 실패했습니다 ({status}).",
  "error.editCore.studioValidateFailed": "스튜디오 검증에 실패했습니다 ({status}).",
  // @podo/icon-build — svg.ts
  "error.iconBuild.svgNoDom": "normalizeIconSvg에는 DOM 환경(DOMParser)이 필요합니다.",
  "error.iconBuild.svgParse": "SVG를 파싱할 수 없습니다.",
  "error.iconBuild.svgSingle": "아이콘은 단일 <svg> 요소여야 합니다.",
  "error.iconBuild.svgNoShapes":
    "SVG에 그릴 수 있는 도형(path, rect, circle, ellipse, line, polygon)이 없습니다.",
  // editor — figma.ts
  "error.figma.collectionMode": "Figma 변수 컬렉션에는 최소 하나의 모드가 포함되어야 합니다.",
  "error.figma.aliasUnresolved": 'Figma 별칭 "{id}"이(가) 가져온 변수를 가리키지 않습니다.',
  "error.figma.tokenPathEmpty": "토큰 경로는 비워 둘 수 없습니다.",
  "error.figma.pathGroupConflict": 'Figma 변수 경로 "{path}"이(가) 토큰 그룹과 충돌합니다.',
  "error.figma.pathTokenConflict": 'Figma 변수 경로 "{path}"이(가) 토큰 "{head}"과(와) 충돌합니다.',
  // editor — icons-model.ts
  "error.icons.noFreeCodepoints":
    "새 아이콘에 사용할 수 있는 사용자 영역(PUA) 코드포인트가 남아 있지 않습니다.",
  // @podo/spec — tokens.ts (zod issues)
  "error.spec.aliasFormat": "별칭 참조는 {token.path} 형식을 사용해야 합니다.",
  "error.spec.colorValue": "색상 토큰은 색상 값이나 별칭 참조를 사용해야 합니다.",
  "error.spec.unitValue": "{type} 토큰은 허용된 단위나 별칭 참조를 사용해야 합니다.",
  "error.spec.typographyInclude":
    "타이포그래피 토큰에는 fontFamily, fontSize, lineHeight, fontWeight, letterSpacing 및 선택적 paragraphSpacing이 포함되어야 합니다.",
  "error.spec.shadowInclude":
    "그림자 토큰에는 x, y, blur, 선택적 spread 및 color가 포함되어야 합니다.",
  "error.spec.cubicBezier":
    "큐빅 베지어 토큰은 0과 1 사이의 네 개 숫자로 이루어진 배열이어야 합니다.",
  "error.spec.borderInclude": "테두리 토큰에는 color, width 및 style이 포함되어야 합니다.",
  "error.spec.motionInclude": "모션 토큰에는 duration, easing 및 선택적 delay가 포함되어야 합니다.",
  "error.spec.numberValue": "숫자 토큰은 숫자 값이나 별칭 참조를 사용해야 합니다.",
  "error.spec.fontWeightValue": "글꼴 굵기 토큰은 숫자, 문자열 또는 별칭 참조를 사용해야 합니다.",
  "error.spec.stringValue": "{type} 토큰은 문자열 값이나 별칭 참조를 사용해야 합니다.",
  // @podo/spec — components.ts (zod issues)
  "error.spec.variantValueToken":
    'valueTokens 키 "{value}"은(는) 변형 "{variant}"의 선언된 값이 아닙니다.',
  "error.spec.anatomyUnique": '해부 구조 부위 이름 "{name}"은(는) 고유해야 합니다.',
  "error.spec.anatomySelfParent":
    '해부 구조 부위 "{name}"은(는) 자기 자신을 부모로 가질 수 없습니다.',
  "error.spec.anatomyParentMissing": '"{name}"의 부모 "{parent}"이(가) 존재하지 않습니다.',
  "error.spec.anatomyCycle": '"{name}"의 해부 구조 계층이 순환을 형성합니다.',
};
