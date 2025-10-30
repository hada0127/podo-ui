import os
import re

# 모든 문서 페이지 SCSS (실제 존재하는 파일만)
scss_pages = [
    'src/app/getting-started/usage/page.module.scss',
    'src/app/foundation/colors/page.module.scss',
    'src/app/foundation/typography/page.module.scss',
    'src/app/foundation/icons/page.module.scss',
    'src/app/foundation/spacing/page.module.scss',
    'src/app/layout/grid/page.module.scss',
    'src/app/layout/responsive/page.module.scss',
    'src/app/components/button/page.module.scss',
    'src/app/components/input/page.module.scss',
    'src/app/components/textarea/page.module.scss',
    'src/app/components/select/page.module.scss',
    'src/app/components/checkbox-radio/page.module.scss',
    'src/app/components/toggle/page.module.scss',
    'src/app/components/table/page.module.scss',
    'src/app/components/tab/page.module.scss',
    'src/app/utilities/border/page.module.scss',
    'src/app/utilities/radius/page.module.scss',
    'src/app/utilities/elevation/page.module.scss',
    'src/app/utilities/display/page.module.scss',
]

for scss_path in scss_pages:
    print(f'\\nProcessing: {scss_path}')

    with open(scss_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # h2를 h1로 변경 (.section 내에서)
    content = re.sub(r'(\\.section[^}]*?\\s+)h2\\s*{', r'\\1h1 {', content)

    # h3를 h2로 변경
    content = re.sub(r'(\\s+)h3\\s*{', r'\\1h2 {', content)

    # h4를 h3로 변경 (혹시 있다면)
    content = re.sub(r'(\\s+)h4\\s*{', r'\\1h3 {', content)

    # .colorInfo, .variantInfo, .swatchSection 등 특정 클래스 내부의 h3도 h2로 변경
    # 단, linkCard 내부는 h4 -> h3로 처리

    with open(scss_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'  ✓ Updated heading styles')

print('\\n✅ All SCSS files updated!')
