import { TexFileUtil } from '../../src/common/TexFileUtil';

test('ts-jest-1', () => {
  const result = TexFileUtil.genTeXTableCode(2,2);
  console.log(result);
})