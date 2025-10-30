import os
import re

# 홈 페이지와 installation 페이지를 제외한 모든 문서 페이지
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
    print(f'\nProcessing: {page_path}')

    with open(page_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # PageHeader import 제거
    content = re.sub(r"import PageHeader from '@/components/PageHeader';\n", '', content)

    # PageHeader 컴포넌트 찾기
    page_header_match = re.search(
        r'<PageHeader\s+title="([^"]+)"\s+description="([^"]+)"\s*/>',
        content
    )

    if page_header_match:
        title = page_header_match.group(1)
        description = page_header_match.group(2)

        # PageHeader를 새로운 section으로 교체
        new_header = f'''<section className={{styles.section}}>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>'''

        content = re.sub(
            r'<PageHeader\s+title="[^"]+"\s+description="[^"]+"\s*/>\s*\n\s*',
            new_header + '\n\n      ',
            content
        )
        print(f'  ✓ Replaced PageHeader with h1 section')

    # h4 -> h3 변경
    h4_count = len(re.findall(r'<h4>', content))
    content = re.sub(r'<h4>', '<h3>', content)
    content = re.sub(r'</h4>', '</h3>', content)
    if h4_count > 0:
        print(f'  ✓ Changed {h4_count} h4 tags to h3')

    # h3 -> h2 변경 (PageHeader 이후에만)
    h3_count = len(re.findall(r'<h3>', content))
    content = re.sub(r'<h3>', '<h2>', content)
    content = re.sub(r'</h3>', '</h2>', content)
    if h3_count > 0:
        print(f'  ✓ Changed {h3_count} h3 tags to h2')

    # h2 -> h1 변경 (PageHeader 이후, 첫 section 제외)
    # 첫 번째 </section> 이후의 모든 h2를 h1으로 변경
    parts = content.split('</section>', 1)
    if len(parts) == 2:
        before_first_section = parts[0] + '</section>'
        after_first_section = parts[1]

        h2_count = len(re.findall(r'<h2>', after_first_section))
        after_first_section = re.sub(r'<h2>', '<h1>', after_first_section)
        after_first_section = re.sub(r'</h2>', '</h1>', after_first_section)

        content = before_first_section + after_first_section
        if h2_count > 0:
            print(f'  ✓ Changed {h2_count} h2 tags to h1')

    # 파일이 변경되었을 때만 저장
    if content != original_content:
        with open(page_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f'  ✓ File updated successfully')
    else:
        print(f'  - No changes needed')

print('\n✓ All pages updated!')
