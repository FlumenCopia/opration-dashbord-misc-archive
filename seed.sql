-- ============================================================
-- SUPABASE DATABASE SEED SCRIPT
-- ============================================================
-- Run this in your Supabase SQL Editor if you ever want to reseed/reset the data.

INSERT INTO dashboard_state (id, data, updated_at)
VALUES (
  'main',
  '{
  "hero": {
    "billed": 646617,
    "banked": 179863,
    "subtext": "Misc Archive Private Limited. One obligation was being counted twice, and removing it puts the business at break-even. From here the whole outcome turns on a single number.",
    "notice": "At 28% collection you fail whatever else you do. At 85% you break even. At 90% plus ₹1L of new recurring revenue you build wealth. That is the entire business in one line."
  },
  "datedItems": [
    {
      "id": "dt1",
      "date": "3 Nov",
      "title": "INC-20A",
      "details": "₹50,000 plus ₹1,000 per director per day after.",
      "urgent": true
    },
    {
      "id": "dt2",
      "date": "5 Oct",
      "title": "First car EMI",
      "details": "Monthly car EMI payment starts.",
      "urgent": false
    },
    {
      "id": "dt3",
      "date": "10 Mar",
      "title": "Bajaj premium auto-debits",
      "details": "₹1,02,250 unless you decide otherwise.",
      "urgent": false
    },
    {
      "id": "dt4",
      "date": "Thozhukkal title",
      "title": "Property Title Clearance",
      "details": "No deadline, longest lead time, blocks the ₹1 crore sale until cleared.",
      "urgent": false
    }
  ],
  "tasks": {
    "w1": [
      {
        "id": "w1_0",
        "title": "Compute April to July billing, month by month",
        "why": "Settles whether GST liability already exists on past supplies. The last unbounded number in the file.",
        "done": false
      },
      {
        "id": "w1_1",
        "title": "Send those figures to the CA with invoice copies",
        "why": "Ask directly: was the threshold crossed, and what is owed from which date.",
        "done": false
      },
      {
        "id": "w1_2",
        "title": "Tell every client GST is additional from this month, in writing",
        "why": "Your terms already say prices exclude taxes. Absorbing it costs about ₹67,000 a month.",
        "done": false
      },
      {
        "id": "w1_3",
        "title": "Call all four card issuers, convert balances to EMI",
        "why": "₹43,700 a year for four phone calls.",
        "done": false
      },
      {
        "id": "w1_4",
        "title": "Call every collectible client personally, not by email",
        "why": "₹6.78L collectible excluding TWC. Ask for a date, then stay quiet.",
        "done": false
      },
      {
        "id": "w1_5",
        "title": "Ask the pledge holder about partial gold release against partial repayment",
        "why": "22% loan-to-value means real headroom. Changes the debt order if it works.",
        "done": false
      },
      {
        "id": "w1_6",
        "title": "Get the ₹1,00,000 subscription money into the company account",
        "why": "INC-20A cannot be filed without it.",
        "done": false
      },
      {
        "id": "w1_7",
        "title": "Instruct a lawyer on the Thozhukkal inherited 4.5 cents",
        "why": "Release deed from Geethamma’s branch plus mutation. Blocks the sale until done.",
        "done": false
      },
      {
        "id": "w1_8",
        "title": "Confirm floating rate and zero foreclosure charge on the car sanction letter",
        "why": "The prepayment plan depends entirely on this being free.",
        "done": false
      },
      {
        "id": "w1_9",
        "title": "Track your actual personal spend for one week",
        "why": "₹15,000 is an estimate, and estimates are what broke the last plan.",
        "done": false
      }
    ],
    "w2": [
      {
        "id": "w2_0",
        "title": "Put new payment terms in writing to every client",
        "why": "100% advance month one, due by the 5th, work pauses on the 6th.",
        "done": false
      },
      {
        "id": "w2_1",
        "title": "Rank all 13 people on billing against salary",
        "why": "Data first. Use the matrix in Team.",
        "done": false
      },
      {
        "id": "w2_2",
        "title": "Agree Sunny’s full number in writing with a deferred date",
        "why": "Acknowledged deferred debt is safe. Unacknowledged becomes a dispute.",
        "done": false
      },
      {
        "id": "w2_3",
        "title": "Set a written cap on total gold pledged at any one time",
        "why": "A buffer without a limit stops being a buffer.",
        "done": false
      },
      {
        "id": "w2_4",
        "title": "Decide the Bajaj policy before March",
        "why": "Two premiums left, ~5% return. Continue, paid-up, or surrender.",
        "done": false
      },
      {
        "id": "w2_5",
        "title": "Book the monthly CA call and GST return date for the 20th",
        "why": "Returns are now a recurring obligation with daily late penalties.",
        "done": false
      },
      {
        "id": "w2_6",
        "title": "Start the 09:00 stand-up and do not miss one",
        "why": "Fifteen minutes, standing, blockers only.",
        "done": false
      },
      {
        "id": "w2_7",
        "title": "Ask three happy clients for one referral each",
        "why": "Costs nothing. Most agencies never ask.",
        "done": false
      }
    ]
  },
  "dayBoard": {
    "anchors": {
      "Mon": [
        "06:30 Movement",
        "07:20 Morning brief",
        "09:00 Stand-up",
        "09:15 Money hour",
        "13:30 Collection calls",
        "18:00 Evening brief",
        "18:30 Hard stop"
      ],
      "Tue": [
        "06:30 Movement",
        "07:20 Morning brief",
        "09:00 Stand-up",
        "11:00 Client meeting",
        "13:30 Collection calls",
        "15:30 Client meeting",
        "18:00 Evening brief",
        "18:30 Hard stop"
      ],
      "Wed": [
        "06:30 Movement",
        "07:20 Morning brief",
        "09:00 Stand-up",
        "11:00 Client meeting",
        "13:30 Collection calls",
        "15:00 Delivery audit",
        "18:00 Evening brief",
        "18:30 Hard stop"
      ],
      "Thu": [
        "07:30 BNI Matrix",
        "09:15 Brief + stand-up",
        "10:00 New business — proposals out",
        "13:30 Collection calls",
        "14:00 BNI one-to-one",
        "15:30 Client meeting",
        "18:00 Evening brief",
        "18:30 Hard stop"
      ],
      "Fri": [
        "06:30 Movement",
        "07:20 Morning brief",
        "09:00 Stand-up",
        "11:00 Client meeting",
        "13:30 Collection calls",
        "16:00 Week close + scorecard",
        "18:00 Evening brief",
        "18:30 Hard stop"
      ],
      "Sat": [
        "09:00 One personal task, then off"
      ],
      "Sun": [
        "Off. Last Sunday of the month — day out, no laptop."
      ]
    },
    "board": {
      "Mon": [],
      "Tue": [],
      "Wed": [],
      "Thu": [],
      "Fri": [],
      "Sat": [],
      "Sun": []
    }
  },
  "collections": [
    {
      "id": "c0",
      "name": "Masters",
      "amount": 250000,
      "category": "a",
      "done": false
    },
    {
      "id": "c1",
      "name": "iLearn",
      "amount": 62125,
      "category": "a",
      "done": false
    },
    {
      "id": "c2",
      "name": "Welgate",
      "amount": 60300,
      "category": "a",
      "done": false
    },
    {
      "id": "c3",
      "name": "RWEN",
      "amount": 59000,
      "category": "a",
      "done": false
    },
    {
      "id": "c4",
      "name": "Susrutha",
      "amount": 53000,
      "category": "a",
      "done": false
    },
    {
      "id": "c5",
      "name": "Pole Marks",
      "amount": 42800,
      "category": "a",
      "done": false
    },
    {
      "id": "c6",
      "name": "S Team",
      "amount": 37880,
      "category": "a",
      "done": false
    },
    {
      "id": "c7",
      "name": "Perfect Interior",
      "amount": 31380,
      "category": "a",
      "done": false
    },
    {
      "id": "c8",
      "name": "Nova Innovation",
      "amount": 28000,
      "category": "a",
      "done": false
    },
    {
      "id": "c9",
      "name": "Parshi",
      "amount": 19375,
      "category": "a",
      "done": false
    },
    {
      "id": "c10",
      "name": "Pranalaya",
      "amount": 18349,
      "category": "a",
      "done": false
    },
    {
      "id": "c11",
      "name": "RRV",
      "amount": 12000,
      "category": "a",
      "done": false
    },
    {
      "id": "c12",
      "name": "Moon Holidays",
      "amount": 3925,
      "category": "a",
      "done": false
    },
    {
      "id": "c13",
      "name": "TWC",
      "amount": 43000,
      "category": "c",
      "done": false
    }
  ],
  "outflows": [
    {
      "id": "o1",
      "name": "Team salaries",
      "amount": 240000,
      "type": "business"
    },
    {
      "id": "o2",
      "name": "Office rent",
      "amount": 18000,
      "type": "business"
    },
    {
      "id": "o3",
      "name": "Space Bar / systems",
      "amount": 32800,
      "type": "business"
    },
    {
      "id": "o4",
      "name": "Admin, power, water",
      "amount": 20000,
      "type": "business"
    },
    {
      "id": "o5",
      "name": "Software and tools",
      "amount": 7394,
      "type": "business"
    },
    {
      "id": "o6",
      "name": "Internet and phone",
      "amount": 5866,
      "type": "business"
    },
    {
      "id": "o7",
      "name": "Cleaning",
      "amount": 3000,
      "type": "business"
    },
    {
      "id": "o8",
      "name": "Car EMI",
      "amount": 32066,
      "type": "committed"
    },
    {
      "id": "o9",
      "name": "Card minimums",
      "amount": 12000,
      "type": "committed"
    },
    {
      "id": "o10",
      "name": "Personal living",
      "amount": 15000,
      "type": "committed"
    }
  ],
  "cashRules": [
    "Salary money is ring-fenced the day it arrives",
    "No new monthly commitment until three consecutive positive months",
    "100% advance for month one, every client, no exception",
    "Personal and company money cross only through a written director''s loan entry"
  ],
  "gstRules": [
    "Charge on top, not absorbed. Your published terms state prices exclude applicable taxes. Say so explicitly when you tell clients. Absorbing 18% is a 15.25% revenue cut, roughly ₹67,000 a month, and it turns break-even into a hole.",
    "Claim input credit on software, rent, internet and equipment. Likely ₹5,000–8,000 a month recovered.",
    "The open question is backward, not forward. If turnover crossed ₹20 lakh earlier in the financial year, liability runs from the crossing date, not the registration date. April–July figures settle it.",
    "Returns are now a monthly obligation. Late filing carries daily penalties and blocks input credit. This is what the 20th on the calendar is for."
  ],
  "growthTarget": {
    "subtext": "₹1,00,000 of new monthly recurring revenue is four retainers at ₹25,000. At a 25% close rate that needs 16 proposals. Over a quarter that is 5–6 proposals a month, or one qualified conversation every three days.",
    "proposalsQuarter": "16",
    "proposalsMonth": "5–6",
    "retainersNeeded": "4"
  },
  "scorecard": [
    {
      "id": "sc1",
      "key": "s1",
      "label": "New conversations started",
      "target": 5,
      "targetLabel": "5",
      "value": ""
    },
    {
      "id": "sc2",
      "key": "s2",
      "label": "Proposals sent",
      "target": 2,
      "targetLabel": "2",
      "value": ""
    },
    {
      "id": "sc3",
      "key": "s3",
      "label": "Upsell conversations with existing clients",
      "target": 2,
      "targetLabel": "2",
      "value": ""
    },
    {
      "id": "sc4",
      "key": "s4",
      "label": "Referrals asked for",
      "target": 3,
      "targetLabel": "3",
      "value": ""
    },
    {
      "id": "sc5",
      "key": "s5",
      "label": "Collection calls made",
      "target": 5,
      "targetLabel": "5",
      "value": ""
    },
    {
      "id": "sc6",
      "key": "s6",
      "label": "Money actually banked this week",
      "target": 100000,
      "targetLabel": "₹1L",
      "value": ""
    }
  ],
  "growthStrategies": [
    {
      "id": "gs1",
      "title": "Upsell what you already have",
      "desc": "Thirteen live clients on one service line each. A digital marketing client never offered SEO or SAG·EO is the easiest sale in the business — no pitching, no trust-building, no acquisition cost. Two upsell conversations a month."
    },
    {
      "id": "gs2",
      "title": "Own the wellness vertical",
      "desc": "Susrutha, Pranalaya, Ayushi. Three Ayurveda and wellness clients is not coincidence, it is a specialism with proof. ''We run digital for Ayurveda hospitals in Kerala'' beats ''we do digital marketing'', and it lets you charge more."
    },
    {
      "id": "gs3",
      "title": "BNI, used properly",
      "desc": "You are Social Media Coordinator at Matrix — a room of business owners who see your work weekly. One structured one-to-one a week with someone you have never pitched."
    },
    {
      "id": "gs4",
      "title": "Referrals, asked for on a schedule",
      "desc": "Every client who says something positive gets asked the same day who else you should be talking to. Most agencies never ask."
    },
    {
      "id": "gs5",
      "title": "Cold outreach, narrow only",
      "desc": "Into verticals where you hold a case study — education after iLearn, real estate after Masters, interiors after Perfect Interior. Never generic."
    }
  ],
  "revenueLadder": [
    {
      "id": "rl1",
      "name": "Project work",
      "tag": "paid once",
      "tagType": "c"
    },
    {
      "id": "rl2",
      "name": "Monthly retainers",
      "tag": "predictable",
      "tagType": "b"
    },
    {
      "id": "rl3",
      "name": "Multi-service accounts",
      "tag": "harder to leave",
      "tagType": "b"
    },
    {
      "id": "rl4",
      "name": "SAG·EO as a named product",
      "tag": "premium, proprietary",
      "tagType": "a"
    },
    {
      "id": "rl5",
      "name": "COSMICX, second market",
      "tag": "new customer base",
      "tagType": "a"
    },
    {
      "id": "rl6",
      "name": "Software subscriptions",
      "tag": "earns without you",
      "tagType": "a"
    }
  ],
  "assetSteps": [
    {
      "id": "ast1",
      "title": "One month of payroll in reserve",
      "desc": "₹2.4 lakh, separate account, untouched. This is the first asset and the one that ends the cycle of pledging gold to make salaries."
    },
    {
      "id": "ast2",
      "title": "Clear the 40% debt",
      "desc": "Paying off a card returns 40% guaranteed. No investment available to you beats that."
    },
    {
      "id": "ast3",
      "title": "Three months of expenses",
      "desc": "₹11.5 lakh. The business now survives a bad quarter without you funding it personally."
    },
    {
      "id": "ast4",
      "title": "Systematic investing, small and automatic",
      "desc": "₹10,000 a month on a standing instruction. The amount is irrelevant; the habit and the date are the point."
    },
    {
      "id": "ast5",
      "title": "Property proceeds, deployed to a plan written before the money lands",
      "desc": "Liabilities, buffer, Section 54 reinvestment, then growth. Money that arrives without a plan gets spent."
    },
    {
      "id": "ast6",
      "title": "Three income sources",
      "desc": "Services, products, capital. That is what makes wealth durable rather than a good year."
    }
  ],
  "weeks13": [
    {
      "id": "wk1",
      "weekNum": 1,
      "theme": "Cash truth",
      "description": "Collections blitz on all thirteen. Cards converted to EMI. GST communicated to every client. April–July figures to the CA."
    },
    {
      "id": "wk2",
      "weekNum": 2,
      "theme": "Terms and team",
      "description": "New payment terms in writing everywhere. Rank all 13 on billing versus salary. Sunny’s number agreed and dated."
    },
    {
      "id": "wk3",
      "weekNum": 3,
      "theme": "Compliance",
      "description": "Subscription money in, INC-20A filed. Lawyer engaged on Thozhukkal. First GST invoices out clean."
    },
    {
      "id": "wk4",
      "weekNum": 4,
      "theme": "First upsells",
      "description": "Two existing clients offered a second service line. October close reviewed against the ₹3.86L baseline."
    },
    {
      "id": "wk5",
      "weekNum": 5,
      "theme": "Vertical positioning",
      "description": "Build the Ayurveda and wellness case study from Susrutha and Pranalaya. This is what lets you charge more."
    },
    {
      "id": "wk6",
      "weekNum": 6,
      "theme": "Pipeline build",
      "description": "Six proposals out using the vertical story. One BNI one-to-one every week from here."
    },
    {
      "id": "wk7",
      "weekNum": 7,
      "theme": "Delivery audit",
      "description": "Every client current. Fix anything slipping before it becomes a payment delay."
    },
    {
      "id": "wk8",
      "weekNum": 8,
      "theme": "First close",
      "description": "Target the first new retainer signed. Gold pledge cleared if collections held."
    },
    {
      "id": "wk9",
      "weekNum": 9,
      "theme": "Systems",
      "description": "Document the two processes only one person knows. Reduce single points of failure."
    },
    {
      "id": "wk10",
      "weekNum": 10,
      "theme": "Second close",
      "description": "Second retainer. Cards cleared. Reserve account opened, however small."
    },
    {
      "id": "wk11",
      "weekNum": 11,
      "theme": "Pricing",
      "description": "Review every client against the rate card. Dated increases at renewal for anyone below it."
    },
    {
      "id": "wk12",
      "weekNum": 12,
      "theme": "Quarter close",
      "description": "Full team matrix. Client profitability. Debt ladder recalculated on actual balances."
    },
    {
      "id": "wk13",
      "weekNum": 13,
      "theme": "Reset",
      "description": "Two days off. Then set the next quarter from real numbers instead of projections."
    }
  ],
  "debtLadder": [
    {
      "id": "d1",
      "obligation": "RBL card",
      "amount": 57598,
      "costTag": "~40% a year",
      "tagType": "c",
      "isCar": false
    },
    {
      "id": "d2",
      "obligation": "One Card",
      "amount": 49878,
      "costTag": "~40% a year",
      "tagType": "c",
      "isCar": false
    },
    {
      "id": "d3",
      "obligation": "Axis card",
      "amount": 41507,
      "costTag": "~40% a year",
      "tagType": "c",
      "isCar": false
    },
    {
      "id": "d4",
      "obligation": "SBI card",
      "amount": 25688,
      "costTag": "~40% a year",
      "tagType": "c",
      "isCar": false
    },
    {
      "id": "d5",
      "obligation": "Gold pledge, via Kannan",
      "amount": 220000,
      "costTag": "family gold at risk",
      "tagType": "b",
      "isCar": false
    },
    {
      "id": "d6",
      "obligation": "Space Bar / systems",
      "amount": 229600,
      "costTag": "₹32,800 × ~7 left",
      "tagType": "b",
      "isCar": false
    },
    {
      "id": "d7",
      "obligation": "Sunny — expenses recognised now",
      "amount": 294000,
      "costTag": "salary claim deferred, in writing",
      "tagType": "b",
      "isCar": false
    },
    {
      "id": "d8",
      "obligation": "Vishnu, net of ₹25,000 back",
      "amount": 136000,
      "costTag": "informal",
      "tagType": "",
      "isCar": false
    },
    {
      "id": "d9",
      "obligation": "Rohini, incl. rent",
      "amount": 105000,
      "costTag": "informal",
      "tagType": "",
      "isCar": false
    },
    {
      "id": "d10",
      "obligation": "Sonu",
      "amount": 50000,
      "costTag": "informal",
      "tagType": "",
      "isCar": false
    },
    {
      "id": "d11",
      "obligation": "Ramani",
      "amount": 50000,
      "costTag": "informal",
      "tagType": "",
      "isCar": false
    },
    {
      "id": "d12",
      "obligation": "ICICI car loan",
      "amount": 2000000,
      "costTag": "8.85% — cheapest money you hold",
      "tagType": "a",
      "isCar": true
    }
  ],
  "debtOrder": [
    "Kannan ₹2,20,000 — releases the family gold",
    "Ramani ₹50,000",
    "Credit cards ₹1,74,671",
    "Space Bar, then Sonu, Vishnu, Rohini, Sunny",
    "Car loan last"
  ],
  "debtNotes": {
    "orderCostDesc": "Cards burn about ₹5,800 a month at 40%. A gold pledge at 12% on ₹2.2 lakh burns about ₹2,200. Gold first costs roughly ₹3,600 a month — a defensible price for protecting family gold, as long as it is a choice and not an accident.",
    "orderCallout": "Ask first: ₹2.2 lakh borrowed against ₹10 lakh of gold is 22% loan-to-value, where lenders go to 75%. Partial repayment should free far more gold than it costs. If partial release works, you protect the gold and clear the cards, and the trade-off disappears.",
    "cardConvertNote": "₹1,74,671 at ~40% costs ₹69,900 a year. The same balance at 15% on a bank EMI plan costs ₹26,200. Four phone calls, ₹43,700 a year. The highest return per hour anywhere in this file.",
    "goldBufferNote": "Releasing ₹70,000 a month as an EMI backstop will get you through a bad month, and it is also how family gold becomes permanently pledged. Set a written cap on total gold pledged at any one time, and attach a repayment date to every draw before you take it. A buffer without an exit date is not a buffer."
  },
  "team": {
    "headcount": 13,
    "totalSalary": 222000,
    "revenueRunRate": 444000,
    "safeMultiplier": 3,
    "matrix": [
      {
        "id": "tm1",
        "signal": "Bills 3×+, clients ask for them by name",
        "reading": "Anchor",
        "action": "Raise before they ask. Add responsibility.",
        "tagType": "a"
      },
      {
        "id": "tm2",
        "signal": "Bills 2–3×, delivery reliable",
        "reading": "Core",
        "action": "Keep. One measurable target this quarter.",
        "tagType": "a"
      },
      {
        "id": "tm3",
        "signal": "Bills 1.5–2×, capable but underloaded",
        "reading": "Underused",
        "action": "Load them before hiring anyone. Most agencies hire here by mistake.",
        "tagType": "b"
      },
      {
        "id": "tm4",
        "signal": "Under 1.5×, output needs rework",
        "reading": "On notice",
        "action": "Written 30-day expectation, two people in the room, dated.",
        "tagType": "b"
      },
      {
        "id": "tm5",
        "signal": "Still under after 30 days",
        "reading": "Exit",
        "action": "Settle in full, in writing. Unpaid exits become disputes.",
        "tagType": "c"
      },
      {
        "id": "tm6",
        "signal": "Only person who can do a thing",
        "reading": "Single point",
        "action": "Document their process this month regardless of performance.",
        "tagType": "c"
      }
    ]
  },
  "teamEquityRules": [
    "Shares already filed at MCA cannot be reversed unilaterally — a transfer needs the holder''s signature. The reset applies forward. One rule prevents a repeat: no equity without either capital in or a written vesting agreement tied to time and milestones.",
    "Unpaid salary is a statutory claim regardless of goodwill or shareholding. Acknowledge the number in writing and attach a date tied to profitability. An acknowledged deferred debt is safe; an unacknowledged one becomes a dispute."
  ],
  "rhythm": {
    "weekday": [
      {
        "time": "06:30",
        "task": "Wake. Move for 30 minutes."
      },
      {
        "time": "07:30",
        "task": "Bank balances and overnight receipts. Two minutes."
      },
      {
        "time": "09:00",
        "task": "Stand-up, 15 minutes, standing. Blockers only."
      },
      {
        "time": "09:15",
        "task": "Deep work — the one thing that matters today."
      },
      {
        "time": "12:30",
        "task": "Lunch, away from the desk."
      },
      {
        "time": "13:30",
        "task": "Collection calls, then sales calls. Never skipped."
      },
      {
        "time": "15:00",
        "task": "Client delivery and review."
      },
      {
        "time": "17:00",
        "task": "Team, one-to-ones, unblocking."
      },
      {
        "time": "18:00",
        "task": "Log cash in and out. Set tomorrow''s one thing."
      },
      {
        "time": "18:30",
        "task": "Stop. Laptop closed."
      },
      {
        "time": "23:00",
        "task": "Sleep."
      }
    ],
    "week": [
      {
        "time": "Mon",
        "task": "09:15 money hour — ageing, bank position, the week''s plan."
      },
      {
        "time": "Tue",
        "task": "11:00 and 15:30 client meetings. Relationship before invoice."
      },
      {
        "time": "Wed",
        "task": "11:00 client meeting · 15:00 delivery audit with leads."
      },
      {
        "time": "Thu",
        "task": "07:30 BNI · 10:00 new business · 14:00 BNI 1-2-1 · 15:30 client."
      },
      {
        "time": "Fri",
        "task": "11:00 client meeting · 16:00 scorecard and week close."
      },
      {
        "time": "Sat",
        "task": "One personal task, then off."
      },
      {
        "time": "Sun",
        "task": "Off. Last Sunday of the month, a day out with no laptop."
      },
      {
        "time": "Quarterly",
        "task": "Three days away, Saturday to Monday, booked two weeks ahead."
      }
    ],
    "month": [
      {
        "time": "1st",
        "task": "Salaries out, before anything else leaves."
      },
      {
        "time": "3rd",
        "task": "Last month closed: billed, collected, spent, kept."
      },
      {
        "time": "5th",
        "task": "Retainers due. Chase on the 6th."
      },
      {
        "time": "10th",
        "task": "Ageing review. Past 45 days escalates."
      },
      {
        "time": "15th",
        "task": "Debt payment day. One line off the ladder."
      },
      {
        "time": "20th",
        "task": "CA call and GST return. Non-negotiable now."
      },
      {
        "time": "25th",
        "task": "Next month forecast and hiring check."
      },
      {
        "time": "Last",
        "task": "One-to-ones. Run the matrix."
      }
    ],
    "quarter": [
      "Team matrix, everyone, written",
      "Client profitability after delivery hours",
      "Price review against the rate card",
      "Debt ladder recalculated on actual balances",
      "One skill invested in",
      "Two days completely away"
    ]
  },
  "phases": [
    {
      "id": "ph1",
      "phaseNum": "1",
      "timeline": "Phase 1 · September – October · survive",
      "title": "Close the unknowns",
      "isCurrent": true,
      "items": [
        {
          "id": "phi1",
          "text": "Collect ₹4L+ of the ₹7.2L outstanding",
          "done": false
        },
        {
          "id": "phi2",
          "text": "Size the GST position from April–July turnover",
          "done": false
        },
        {
          "id": "phi3",
          "text": "File INC-20A before 3 November",
          "done": false
        },
        {
          "id": "phi4",
          "text": "Convert all four cards to bank EMI",
          "done": false
        },
        {
          "id": "phi5",
          "text": "Start Thozhukkal title clearance — release deed and mutation on the inherited 4.5 cents",
          "done": false
        },
        {
          "id": "phi6",
          "text": "GST charged on top of price, communicated to every client in writing",
          "done": false
        }
      ],
      "doneLooksLike": "October closes without new borrowing."
    },
    {
      "id": "ph2",
      "phaseNum": "2",
      "timeline": "Phase 2 · November – February · stabilise",
      "title": "Positive months, consecutively",
      "isCurrent": false,
      "items": [
        {
          "id": "phi7",
          "text": "Collection above 85% for three months running",
          "done": false
        },
        {
          "id": "phi8",
          "text": "₹1,00,000 of new recurring revenue added",
          "done": false
        },
        {
          "id": "phi9",
          "text": "Revenue per head above 2.5×",
          "done": false
        },
        {
          "id": "phi10",
          "text": "Gold pledge and cards cleared",
          "done": false
        },
        {
          "id": "phi11",
          "text": "One month of payroll in reserve, untouched",
          "done": false
        },
        {
          "id": "phi12",
          "text": "Health cover for you and the four elders",
          "done": false
        }
      ],
      "doneLooksLike": "₹1L monthly surplus and a reserve you never dip into."
    },
    {
      "id": "ph3",
      "phaseNum": "3",
      "timeline": "Phase 3 · March – August 2027 · build",
      "title": "Margin, then a second income line",
      "isCurrent": false,
      "items": [
        {
          "id": "phi13",
          "text": "₹6.5–8L monthly billing with the same team",
          "done": false
        },
        {
          "id": "phi14",
          "text": "All informal debt cleared",
          "done": false
        },
        {
          "id": "phi15",
          "text": "Three months of expenses in reserve",
          "done": false
        },
        {
          "id": "phi16",
          "text": "Property sale closed, tax route decided in advance",
          "done": false
        },
        {
          "id": "phi17",
          "text": "COSMICX launched as a real second line",
          "done": false
        },
        {
          "id": "phi18",
          "text": "First systematic investment on a standing instruction",
          "done": false
        }
      ],
      "doneLooksLike": "debt-free except the car, saving every month."
    },
    {
      "id": "ph4",
      "phaseNum": "4",
      "timeline": "September 2027 onward · compound",
      "title": "Assets that earn without you",
      "isCurrent": false,
      "items": [
        {
          "id": "phi19",
          "text": "Property proceeds deployed to a plan written before the money lands",
          "done": false
        },
        {
          "id": "phi20",
          "text": "Agency running on systems, not on your presence",
          "done": false
        },
        {
          "id": "phi21",
          "text": "One product taken to market, funded by profit",
          "done": false
        },
        {
          "id": "phi22",
          "text": "Income from services, products and capital",
          "done": false
        },
        {
          "id": "phi23",
          "text": "Elder-care fund ring-fenced and separate",
          "done": false
        }
      ],
      "doneLooksLike": "Assets earning passively.",
      "callout": "₹7 lakh a cent is the market. ₹8–10 lakh is a hope attached to a road. Plan on ₹77 lakh, treat anything above as a gift, and remember a sale this size in Kerala routinely takes 6–18 months from listing to registration."
    }
  ]
}'::jsonb,
  now()
)
ON CONFLICT (id) 
DO UPDATE SET 
  data = EXCLUDED.data,
  updated_at = now()
RETURNING *;
