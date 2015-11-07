/*
Language: Ini
Contributors: Guillaume Gomez <guillaume1.gomez@gmail.com>
Category: common, config
*/

function(hljs) {
  return {
  case_insensitive: true, // language is case-insensitive
  contains: [
    {
      className: 'setting',
      end: '='
    },
    {
      className: 'value',
      begin: '='
    },
    hljs.HASH_COMMENT_MODE
  ]
};
}
