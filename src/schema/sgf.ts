export enum SgfRootProps {
  FILE_FORMAT = 'FF',
  GAME_TYPE = 'GM', // 1 for Go
  ENCODING = 'CA',
  BOARD_SIZE = 'SZ',
  APPLICATION = 'AP', // in format `name:version`
  EVENT_NAME = 'EV',
  EVENT_LOCATION = 'PC',
  GAME_NAME = 'GN',
  GAME_DATE = 'DT',
  GAME_RULES = 'RU',
  GAME_ROUND = 'RO', // in format `round (type)`
  GAME_KOMI = 'KM',
  GAME_RESULT = 'RE',
  GAME_TIME = 'TM', // in seconds
  GAME_OVERTIME = 'OT',
  BLACK_NAME = 'PB',
  BLACK_RANK = 'RB',
  BLACK_TEAM = 'BT',
  WHITE_NAME = 'PW',
  WHITE_RANK = 'RW',
  WHITE_TEAM = 'WT',
  COPYRIGHT = 'CP',
  COMMENT = 'GC',
}

export enum CustomSgfProps {
  BLACK_ID = 'XABID',
  WHITE_ID = 'XAWID',
  GAME_AI = 'XAAI',
  GAME_YT = 'XAYT',
  GAME_OGS = 'XAOGS',
}
