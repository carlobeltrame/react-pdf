import layoutEngine from './layout';
import linebreaker from './engines/linebreaker';
import justification from './engines/justification';
import textDecoration from './engines/textDecoration';
import scriptItemizer from './engines/scriptItemizer';
import wordHyphenation from './engines/wordHyphenation';
import fontSubstitution from './engines/fontSubstitution';
import attributedStringFromFragments from './attributedString/fromFragments';
import attributedStringAdvanceWidth from './attributedString/advanceWidth';
import runAdvanceWidth from './run/advanceWidth';
import runHeight from './run/height';
import runDescent from './run/descent';
import attributedStringAscent from './attributedString/ascent';

const engines = {
  linebreaker,
  justification,
  textDecoration,
  scriptItemizer,
  wordHyphenation,
  fontSubstitution,
};

const engine = layoutEngine(engines);

export default engine;
export {
  layoutEngine,
  linebreaker,
  justification,
  textDecoration,
  scriptItemizer,
  wordHyphenation,
  fontSubstitution,
  attributedStringFromFragments,
  attributedStringAdvanceWidth,
  runAdvanceWidth,
  runHeight,
  runDescent,
  attributedStringAscent,
};
