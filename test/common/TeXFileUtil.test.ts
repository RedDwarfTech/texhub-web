import { TexFileUtil } from '../../src/common/TexFileUtil';

test('generate latex table', () => {
  const result = TexFileUtil.genTeXTableCode(2,2);
  console.log(result);
})