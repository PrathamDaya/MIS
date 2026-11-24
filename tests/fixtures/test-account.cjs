"use strict";

// Synthetic-only fixture: reserved .test addresses and invented company names.
const account = {
  id: "MIS_TEST_ACCOUNT_FIXTURE",
  label: "MIS Test Account (synthetic; not a login)",
  asOf: "2026-11-24",
  email: "mis-test-account@example.test",
  cases: [
  {
    "id": 1,
    "n": "TEST Company 01",
    "an": "Test Analyst 1",
    "gh": "Test Group Head 1",
    "em": "client1@example.test",
    "a": 1000000,
    "lt": "A-",
    "st": "A2",
    "cd": "2026-06-01",
    "cm": "2026-06-01",
    "lp": "2026-06-02",
    "ud": "2026-06-02",
    "sd": "2026-06-02",
    "ncd": true,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-03",
        "r1": "2026-06-10",
        "r2": "2026-06-17"
      }
    }
  },
  {
    "id": 2,
    "n": "TEST Company 02",
    "an": "Test Analyst 2",
    "gh": "Test Group Head 2",
    "em": "client2@example.test",
    "a": 1375000,
    "lt": "BBB+",
    "st": "A3",
    "cd": "2026-06-03",
    "cm": "2026-06-03",
    "lp": "2026-06-04",
    "ud": "2026-06-04",
    "sd": "2026-06-04",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-05",
        "r1": "2026-06-12",
        "r2": "2026-06-19"
      }
    }
  },
  {
    "id": 3,
    "n": "TEST Company 03",
    "an": "Test Analyst 3",
    "gh": "Test Group Head 3",
    "em": "client3@example.test",
    "a": 1750000,
    "lt": "BB+",
    "st": "A4",
    "cd": "2026-06-05",
    "cm": "2026-06-05",
    "lp": "2026-06-06",
    "ud": "2026-06-06",
    "sd": "2026-06-06",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-07",
        "r1": "2026-06-14",
        "r2": "2026-06-21"
      }
    }
  },
  {
    "id": 4,
    "n": "TEST Company 04",
    "an": "Test Analyst 4",
    "gh": "Test Group Head 1",
    "em": "client4@example.test",
    "a": 2125000,
    "lt": "B",
    "st": "B",
    "cd": "2026-06-07",
    "cm": "2026-06-07",
    "lp": "2026-06-08",
    "ud": "2026-06-08",
    "sd": "2026-06-08",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-09",
        "r1": "2026-06-16",
        "r2": "2026-06-23"
      }
    }
  },
  {
    "id": 5,
    "n": "TEST Company 05",
    "an": "Test Analyst 1",
    "gh": "Test Group Head 2",
    "em": "client5@example.test",
    "a": 2500000,
    "lt": "A-",
    "st": "A2",
    "cd": "2026-06-09",
    "cm": "2026-06-09",
    "lp": "2026-06-10",
    "ud": "2026-06-10",
    "sd": "2026-06-10",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-11",
        "r1": "2026-06-18",
        "r2": "2026-06-25"
      }
    }
  },
  {
    "id": 6,
    "n": "TEST Company 06",
    "an": "Test Analyst 2",
    "gh": "Test Group Head 3",
    "em": "client6@example.test",
    "a": 2875000,
    "lt": "BBB+",
    "st": "A3",
    "cd": "2026-06-11",
    "cm": "2026-06-11",
    "lp": "2026-06-12",
    "ud": "2026-06-12",
    "sd": "2026-06-12",
    "ncd": true,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-13",
        "r1": "2026-06-20",
        "r2": "2026-06-27"
      }
    }
  },
  {
    "id": 7,
    "n": "TEST Company 07",
    "an": "Test Analyst 3",
    "gh": "Test Group Head 1",
    "em": "client7@example.test",
    "a": 3250000,
    "lt": "BB+",
    "st": "A4",
    "cd": "2026-06-13",
    "cm": "2026-06-13",
    "lp": "2026-06-14",
    "ud": "2026-06-14",
    "sd": "2026-06-14",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-15",
        "r1": "2026-06-22",
        "r2": "2026-06-29"
      }
    }
  },
  {
    "id": 8,
    "n": "TEST Company 08",
    "an": "Test Analyst 4",
    "gh": "Test Group Head 2",
    "em": "client8@example.test",
    "a": 3625000,
    "lt": "B",
    "st": "B",
    "cd": "2026-06-15",
    "cm": "2026-06-15",
    "lp": "2026-06-16",
    "ud": "2026-06-16",
    "sd": "2026-06-16",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-17",
        "r1": "2026-06-24",
        "r2": "2026-07-01"
      }
    }
  },
  {
    "id": 9,
    "n": "TEST Company 09",
    "an": "Test Analyst 1",
    "gh": "Test Group Head 3",
    "em": "client9@example.test",
    "a": 4000000,
    "lt": "A-",
    "st": "A2",
    "cd": "2026-06-17",
    "cm": "2026-06-17",
    "lp": "2026-06-18",
    "ud": "2026-06-18",
    "sd": "2026-06-18",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-19",
        "r1": "2026-06-26",
        "r2": "2026-07-03"
      }
    }
  },
  {
    "id": 10,
    "n": "TEST Company 10",
    "an": "Test Analyst 2",
    "gh": "Test Group Head 1",
    "em": "client10@example.test",
    "a": 4375000,
    "lt": "BBB+",
    "st": "A3",
    "cd": "2026-06-19",
    "cm": "2026-06-19",
    "lp": "2026-06-20",
    "ud": "2026-06-20",
    "sd": "2026-06-20",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-21",
        "r1": "2026-06-28",
        "r2": "2026-07-05"
      }
    }
  },
  {
    "id": 11,
    "n": "TEST Company 11",
    "an": "Test Analyst 3",
    "gh": "Test Group Head 2",
    "em": "client11@example.test",
    "a": 4750000,
    "lt": "BB+",
    "st": "A4",
    "cd": "2026-06-21",
    "cm": "2026-06-21",
    "lp": "2026-06-22",
    "ud": "2026-06-22",
    "sd": "2026-06-22",
    "ncd": true,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-23",
        "r1": "2026-06-30",
        "r2": "2026-07-07"
      }
    }
  },
  {
    "id": 12,
    "n": "TEST Company 12",
    "an": "Test Analyst 4",
    "gh": "Test Group Head 3",
    "em": "client12@example.test",
    "a": 5125000,
    "lt": "B",
    "st": "B",
    "cd": "2026-06-23",
    "cm": "2026-06-23",
    "lp": "2026-06-24",
    "ud": "2026-06-24",
    "sd": "2026-06-24",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-25",
        "r1": "2026-07-02",
        "r2": "2026-07-09"
      }
    }
  },
  {
    "id": 13,
    "n": "TEST Company 13",
    "an": "Test Analyst 1",
    "gh": "Test Group Head 1",
    "em": "client13@example.test",
    "a": 5500000,
    "lt": "A-",
    "st": "A2",
    "cd": "2026-06-25",
    "cm": "2026-06-25",
    "lp": "2026-06-26",
    "ud": "2026-06-26",
    "sd": "2026-06-26",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-27",
        "r1": "2026-07-04",
        "r2": "2026-07-11"
      }
    }
  },
  {
    "id": 14,
    "n": "TEST Company 14",
    "an": "Test Analyst 2",
    "gh": "Test Group Head 2",
    "em": "client14@example.test",
    "a": 5875000,
    "lt": "BBB+",
    "st": "A3",
    "cd": "2026-06-27",
    "cm": "2026-06-27",
    "lp": "2026-06-28",
    "ud": "2026-06-28",
    "sd": "2026-06-28",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-06-29",
        "r1": "2026-07-06",
        "r2": "2026-07-13"
      }
    }
  },
  {
    "id": 15,
    "n": "TEST Company 15",
    "an": "Test Analyst 3",
    "gh": "Test Group Head 3",
    "em": "client15@example.test",
    "a": 6250000,
    "lt": "BB+",
    "st": "A4",
    "cd": "2026-06-29",
    "cm": "2026-06-29",
    "lp": "2026-06-30",
    "ud": "2026-06-30",
    "sd": "2026-06-30",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-07-01",
        "r1": "2026-07-08",
        "r2": "2026-07-15"
      }
    }
  },
  {
    "id": 16,
    "n": "TEST Company 16",
    "an": "Test Analyst 4",
    "gh": "Test Group Head 1",
    "em": "client16@example.test",
    "a": 6625000,
    "lt": "B",
    "st": "B",
    "cd": "2026-07-01",
    "cm": "2026-07-01",
    "lp": "2026-07-02",
    "ud": "2026-07-02",
    "sd": "2026-07-02",
    "ncd": true,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-07-03",
        "r1": "2026-07-10",
        "r2": "2026-07-17"
      }
    }
  },
  {
    "id": 17,
    "n": "TEST Company 17",
    "an": "Test Analyst 1",
    "gh": "Test Group Head 2",
    "em": "client17@example.test",
    "a": 7000000,
    "lt": "A-",
    "st": "A2",
    "cd": "2026-07-03",
    "cm": "2026-07-03",
    "lp": "2026-07-04",
    "ud": "2026-07-04",
    "sd": "2026-07-04",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-07-05",
        "r1": "2026-07-12",
        "r2": "2026-07-19"
      }
    }
  },
  {
    "id": 18,
    "n": "TEST Company 18",
    "an": "Test Analyst 2",
    "gh": "Test Group Head 3",
    "em": "client18@example.test",
    "a": 7375000,
    "lt": "BBB+",
    "st": "A3",
    "cd": "2026-07-05",
    "cm": "2026-07-05",
    "lp": "2026-07-06",
    "ud": "2026-07-06",
    "sd": "2026-07-06",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-07-07",
        "r1": "2026-07-14",
        "r2": "2026-07-21"
      }
    }
  },
  {
    "id": 19,
    "n": "TEST Company 19",
    "an": "Test Analyst 3",
    "gh": "Test Group Head 1",
    "em": "client19@example.test",
    "a": 7750000,
    "lt": "BB+",
    "st": "A4",
    "cd": "2026-07-07",
    "cm": "2026-07-07",
    "lp": "2026-07-08",
    "ud": "2026-07-08",
    "sd": "2026-07-08",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-07-09",
        "r1": "2026-07-16",
        "r2": "2026-07-23"
      }
    }
  },
  {
    "id": 20,
    "n": "TEST Company 20",
    "an": "Test Analyst 4",
    "gh": "Test Group Head 2",
    "em": "client20@example.test",
    "a": 8125000,
    "lt": "B",
    "st": "B",
    "cd": "2026-07-09",
    "cm": "2026-07-09",
    "lp": "2026-07-10",
    "ud": "2026-07-10",
    "sd": "2026-07-10",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-07-11",
        "r1": "2026-07-18",
        "r2": "2026-07-25"
      }
    }
  },
  {
    "id": 21,
    "n": "TEST Active Timer 1",
    "an": "Test Analyst 1",
    "gh": "Test Group Head 1",
    "em": "active1@example.test",
    "cd": "2026-11-03",
    "cm": "2026-11-03",
    "lp": "2026-11-04",
    "sd": "",
    "ud": "",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-11-05"
      }
    }
  },
  {
    "id": 22,
    "n": "TEST Active Timer 2",
    "an": "Test Analyst 2",
    "gh": "Test Group Head 1",
    "em": "active2@example.test",
    "cd": "2026-11-04",
    "cm": "2026-11-04",
    "lp": "2026-11-02",
    "sd": "2026-11-05",
    "ud": "",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-11-06"
      }
    }
  },
  {
    "id": 23,
    "n": "TEST Active Timer 3",
    "an": "Test Analyst 3",
    "gh": "Test Group Head 1",
    "em": "active3@example.test",
    "cd": "2026-11-05",
    "cm": "2026-11-05",
    "lp": "2026-11-03",
    "sd": "",
    "ud": "",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-11-07"
      }
    }
  },
  {
    "id": 24,
    "n": "TEST Active Timer 4",
    "an": "Test Analyst 4",
    "gh": "Test Group Head 1",
    "em": "active4@example.test",
    "cd": "2026-11-06",
    "cm": "2026-11-06",
    "lp": "2026-11-04",
    "sd": "",
    "ud": "",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-11-08"
      }
    }
  },
  {
    "id": 25,
    "n": "TEST Active Timer 5",
    "an": "Test Analyst 1",
    "gh": "Test Group Head 1",
    "em": "active5@example.test",
    "cd": "2026-11-07",
    "cm": "2026-11-07",
    "lp": "2026-11-05",
    "sd": "",
    "ud": "",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {
        "m1": "2026-11-09"
      }
    }
  },
  {
    "id": 26,
    "n": "TEST Legacy Pending 1",
    "an": "Test Analyst 2",
    "gh": "Test Group Head 2",
    "em": "legacy1@example.test",
    "cd": "2026-11-10",
    "lp": "2026-11-09",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {}
    }
  },
  {
    "id": 27,
    "n": "TEST Legacy Pending 2",
    "an": "Test Analyst 2",
    "gh": "Test Group Head 2",
    "em": "legacy2@example.test",
    "cd": "2026-11-11",
    "lp": "2026-11-10",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {}
    }
  },
  {
    "id": 28,
    "n": "TEST Legacy Pending 3",
    "an": "Test Analyst 2",
    "gh": "Test Group Head 2",
    "em": "legacy3@example.test",
    "cd": "2026-11-12",
    "lp": "2026-11-11",
    "ncd": false,
    "tr": false,
    "w": false,
    "ml": {
      "d": {}
    }
  },
  {
    "id": 29,
    "n": "TEST Future Committee 1",
    "an": "Test Analyst 3",
    "gh": "Test Group Head 3",
    "em": "future1@example.test",
    "cd": "2026-11-25",
    "lp": "2026-11-22",
    "cm": "2026-11-25",
    "ncd": false,
    "tr": false,
    "w": false
  },
  {
    "id": 30,
    "n": "TEST Future Committee 2",
    "an": "Test Analyst 3",
    "gh": "Test Group Head 3",
    "em": "future2@example.test",
    "cd": "2026-11-26",
    "lp": "2026-11-23",
    "cm": "",
    "ncd": false,
    "tr": false,
    "w": false
  },
  {
    "id": 31,
    "n": "TEST Future Committee 3",
    "an": "Test Analyst 3",
    "gh": "Test Group Head 3",
    "em": "future3@example.test",
    "cd": "2026-11-27",
    "lp": "2026-11-24",
    "cm": "",
    "ncd": false,
    "tr": false,
    "w": false
  },
  {
    "id": 32,
    "n": "TEST Future Committee 4",
    "an": "Test Analyst 3",
    "gh": "Test Group Head 3",
    "em": "future4@example.test",
    "cd": "2026-11-28",
    "lp": "2026-11-25",
    "cm": "",
    "ncd": false,
    "tr": false,
    "w": false
  },
  {
    "id": 33,
    "n": "TEST Transferred",
    "an": "Test Analyst 1",
    "gh": "Test Group Head 1",
    "em": "transferred@example.test",
    "cd": "2026-11-01",
    "lp": "2026-10-30",
    "cm": "2026-11-01",
    "ncd": false,
    "tr": true,
    "w": false
  },
  {
    "id": 34,
    "n": "TEST Withdrawn",
    "an": "Test Analyst 4",
    "gh": "Test Group Head 2",
    "em": "withdrawn@example.test",
    "cd": "2026-11-02",
    "lp": "2026-10-30",
    "cm": "2026-11-02",
    "ncd": false,
    "tr": false,
    "w": true
  },
  {
    "id": 35,
    "n": "TEST No Committee Date",
    "an": "Test Analyst 4",
    "gh": "Test Group Head 3",
    "em": "no-date@example.test",
    "cd": "",
    "lp": "2026-11-20",
    "cm": "",
    "ncd": false,
    "tr": false,
    "w": false
  }
]
};

module.exports = Object.freeze(account);
