const fs = require("fs");
const patches = {
  ru: {
    community: {
      hubStats: {
        messages: "Сообщ.",
        forum: "Форум",
        board: "Доска",
        news: "Новости",
        sectionLinks: "Разделы",
      },
    },
    requests: {
      hubStats: { new: "Новые", inProgress: "В работе", archive: "Архив" },
      newDesc: "Описание проблемы и фото",
    },
    payments: {
      hubStats: { households: "Дома", paid: "Оплачено", unpaid: "Не оплачено" },
    },
    profile: {
      hubSectionInfo: "Справка",
      hubSectionApp: "Приложение",
      hubSectionAccount: "Аккаунт",
      memorandumDesc: "Правила взаимодействия",
      tariffsDesc: "Тарифы посёлка",
      chairPanelDesc: "Управление и модерация",
    },
    votes: {
      responsesCount:
        "{count, plural, one {# голос} few {# голоса} many {# голосов} other {# голоса}}",
      voteThanks: "Спасибо, голос учтён!",
    },
    dashboard: {
      popularNewsTitle: "Популярная новость",
      popularNewsText: "«{title}» — {count} лайков за неделю",
    },
  },
  uk: {
    community: {
      hubStats: {
        messages: "Повід.",
        forum: "Форум",
        board: "Дошка",
        news: "Новини",
        sectionLinks: "Розділи",
      },
    },
    requests: {
      hubStats: { new: "Нові", inProgress: "В роботі", archive: "Архів" },
      newDesc: "Опис проблеми та фото",
    },
    payments: {
      hubStats: {
        households: "Будинки",
        paid: "Сплачено",
        unpaid: "Не сплачено",
      },
    },
    profile: {
      hubSectionInfo: "Довідка",
      hubSectionApp: "Додаток",
      hubSectionAccount: "Акаунт",
      memorandumDesc: "Правила взаємодії",
      tariffsDesc: "Тарифи поселення",
      chairPanelDesc: "Керування та модерація",
    },
    votes: {
      responsesCount:
        "{count, plural, one {# голос} few {# голоси} many {# голосів} other {# голоси}}",
      voteThanks: "Дякуємо, голос враховано!",
    },
    dashboard: {
      popularNewsTitle: "Популярна новина",
      popularNewsText: "«{title}» — {count} лайків за тиждень",
    },
  },
  en: {
    community: {
      hubStats: {
        messages: "Msgs",
        forum: "Forum",
        board: "Board",
        news: "News",
        sectionLinks: "Sections",
      },
    },
    requests: {
      hubStats: { new: "New", inProgress: "In progress", archive: "Archive" },
      newDesc: "Describe the issue and add a photo",
    },
    payments: {
      hubStats: { households: "Homes", paid: "Paid", unpaid: "Unpaid" },
    },
    profile: {
      hubSectionInfo: "Info",
      hubSectionApp: "App",
      hubSectionAccount: "Account",
      memorandumDesc: "Community rules",
      tariffsDesc: "Tariffs",
      chairPanelDesc: "Management tools",
    },
    votes: {
      responsesCount: "{count, plural, one {# vote} other {# votes}}",
      voteThanks: "Thanks, your vote counts!",
    },
    dashboard: {
      popularNewsTitle: "Popular news",
      popularNewsText: '"{title}" — {count} likes this week',
    },
  },
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      target[key] = target[key] || {};
      deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
}

for (const loc of ["ru", "uk", "en"]) {
  const p = require("path").join(__dirname, "..", "messages", `${loc}.json`);
  const j = JSON.parse(fs.readFileSync(p, "utf8"));
  deepMerge(j, patches[loc]);
  fs.writeFileSync(p, JSON.stringify(j, null, 2) + "\n");
}
