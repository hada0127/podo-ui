import os
import re

# 홈 페이지를 제외한 모든 문서 페이지
pages = [
    'src/app/getting-started/usage/page.tsx',
    'src/app/foundation/colors/page.tsx',
    'src/app/foundation/typography/page.tsx',
    'src/app/foundation/icons/page.tsx',
    'src/app/foundation/spacing/page.tsx',
    'src/app/layout/grid/page.tsx',
    'src/app/layout/responsive/page.tsx',
    'src/app/components/button/page.tsx',
    'src/app/components/input/page.tsx',
    'src/app/components/textarea/page.tsx',
    'src/app/components/select/page.tsx',
    'src/app/components/checkbox-radio/page.tsx',
    'src/app/components/toggle/page.tsx',
    'src/app/components/file/page.tsx',
    'src/app/components/editor/page.tsx',
    'src/app/components/field/page.tsx',
    'src/app/components/table/page.tsx',
    'src/app/components/tab/page.tsx',
    'src/app/components/pagination/page.tsx',
    'src/app/utilities/border/page.tsx',
    'src/app/utilities/radius/page.tsx',
    'src/app/utilities/elevation/page.tsx',
    'src/app/utilities/display/page.tsx',
]

for page_path in pages:
    print(f'\\nProcessing: {page_path}')

    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # PageHeader import 제거
    content = re.sub(r"import PageHeader from '@/components/PageHeader';\n", '', content)

    # PageHeader 컴포넌트 사용 찾기 (title과 description 추출)
    page_header_match = re.search(
        r'<PageHeader\\s+title="([^"]+)"\\s+description="([^"]+)"\\s*/>',
        content
    )

    if page_header_match:
        title = page_header_match.group(1)
        description = page_header_match.group(2)
        print(f'  Found PageHeader: {title}')

        # PageHeader를 첫 번째 section으로 교체
        new_header = f'''<section className={{styles.section}}>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>'''

        content = re.sub(
            r'<PageHeader\\s+title="[^"]+"\\s+description="[^"]+"\\s*/>\\s*',
            new_header + '\\n\\n      ',
            content
        )

    # h4 -> h3
    content = re.sub(r'<h4>', '<h3>', content)
    content = re.sub(r'</h4>', '</h3>', content)

    # h3 -> h2
    content = re.sub(r'<h3>', '<h2>', content)
    content = re.sub(r'</h3>', '</h2>', content)

    # h2 -> h1 (section 내부의 주요 제목만)
    content = re.sub(r'<h2>', '<h1>', content)
    content = re.sub(r'</h2>', '</h1>', content)

    with open(page_path, 'w', encoding='utf-8') as f:
        f.write(content)

    print(f'  ✓ Updated')

print('\\n✅ All pages updated!')
