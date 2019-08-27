import scripts from './deploy';
import dict from './dict';
import release from './release';
import diff from './diff';

export default [...scripts, ...dict, ...release, ...diff];
