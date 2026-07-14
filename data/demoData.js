window.DEMO_DATA = {
  users: {
    father: {
      id: "father",
      note: "健",
      username: "takeshi_ito",
      avatarText: "🏎️",
      age: 42,
      gender: "男性",
      shareLevel: "strong",
      interests: ["車", "筋トレ", "Michael Jackson"],
      services: {
        YouTube: true,
        TikTok: false,
        X: true,
        Spotify: true,
        Netflix: false,
        Instagram: false
      }
    },

    daughter: {
      id: "daughter",
      note: "ほたる",
      username: "hotaru_ito",
      avatarText: "✨",
      age: 16,
      gender: "女性",
      shareLevel: "weak",
      interests: ["ヒップホップ", "ラップ", "ファッション"],
      services: {
        YouTube: true,
        TikTok: true,
        X: true,
        Spotify: false,
        Netflix: false,
        Instagram: true
      }
    },

    mobA: {
      id: "mobA",
      note: "mobA",
      username: "mob_a",
      avatarText: "A",
      age: 20,
      gender: "回答しない",
      shareLevel: "weak",
      interests: ["背景"],
      isBackground: true,
      services: {
        YouTube: false,
        TikTok: false,
        X: false,
        Spotify: false,
        Netflix: false,
        Instagram: false
      }
    },

    mobB: {
      id: "mobB",
      note: "mobB",
      username: "mob_b",
      avatarText: "B",
      age: 21,
      gender: "回答しない",
      shareLevel: "weak",
      interests: ["背景"],
      isBackground: true,
      services: {
        YouTube: false,
        TikTok: false,
        X: false,
        Spotify: false,
        Netflix: false,
        Instagram: false
      }
    },

    mobC: {
      id: "mobC",
      note: "mobC",
      username: "mob_c",
      avatarText: "C",
      age: 22,
      gender: "回答しない",
      shareLevel: "weak",
      interests: ["背景"],
      isBackground: true,
      services: {
        YouTube: false,
        TikTok: false,
        X: false,
        Spotify: false,
        Netflix: false,
        Instagram: false
      }
    },

    mobD: {
      id: "mobD",
      note: "mobD",
      username: "mob_d",
      avatarText: "D",
      age: 23,
      gender: "回答しない",
      shareLevel: "strong",
      interests: ["背景"],
      isBackground: true,
      services: {
        YouTube: false,
        TikTok: false,
        X: false,
        Spotify: false,
        Netflix: false,
        Instagram: false
      }
    },

    mobE: {
      id: "mobE",
      note: "mobE",
      username: "mob_e",
      avatarText: "E",
      age: 24,
      gender: "回答しない",
      shareLevel: "strong",
      interests: ["背景"],
      isBackground: true,
      services: {
        YouTube: false,
        TikTok: false,
        X: false,
        Spotify: false,
        Netflix: false,
        Instagram: false
      }
    },

    mobF: {
      id: "mobF",
      note: "mobF",
      username: "mob_f",
      avatarText: "F",
      age: 25,
      gender: "回答しない",
      shareLevel: "strong",
      interests: ["背景"],
      isBackground: true,
      services: {
        YouTube: false,
        TikTok: false,
        X: false,
        Spotify: false,
        Netflix: false,
        Instagram: false
      }
    }
  },

  views: {
    father: {
      currentUserId: "father",
      defaultMode: "weak",
      initialConnectedIds: [],
      receiveCandidateId: "daughter",
      defaultContactNotes: {
        daughter: "娘"
      },
      recommendations: [
        {
          kind: "target",
          type: "音楽入門",
          title: "ヒップホップで使われるフロウとライムの基礎",
          source: "音楽メディア・約6分"
        },
        {
          kind: "bridge",
          type: "音楽史",
          title: "マイケル・ジャクソンがヒップホップに与えた影響",
          source: "Web記事・約7分"
        },
        {
          kind: "target",
          type: "カルチャー",
          title: "ラップの歌詞に強い表現が使われる理由",
          source: "音楽メディア・約5分"
        },
        {
          kind: "bridge",
          type: "カルチャー",
          title: "カスタムカーとヒップホップ文化のつながり",
          source: "Web記事・約8分"
        },
        {
          kind: "target",
          type: "ファッション",
          title: "高校生に広がるストリートファッションの現在",
          source: "Web記事・約6分"
        },
        {
          kind: "bridge",
          type: "パフォーマンス",
          title: "ライブパフォーマンスを支える体力づくり",
          source: "動画・9分"
        }
      ]
    },

    daughter: {
      currentUserId: "daughter",
      defaultMode: "strong",
      initialConnectedIds: [
        "father",
        "mobA",
        "mobB",
        "mobC",
        "mobD",
        "mobE",
        "mobF"
      ],
      receiveCandidateId: null,
      defaultContactNotes: {
        father: "父",
        mobA: "mobA",
        mobB: "mobB",
        mobC: "mobC",
        mobD: "mobD",
        mobE: "mobE",
        mobF: "mobF"
      },
      recommendations: [
        {
          kind: "target",
          type: "音楽",
          title: "マイケル・ジャクソンの音楽を今あらためて聴く",
          source: "音楽メディア・約6分"
        },
        {
          kind: "bridge",
          type: "音楽史",
          title: "マイケル・ジャクソンがヒップホップに与えた影響",
          source: "Web記事・約7分"
        },
        {
          kind: "target",
          type: "自動車",
          title: "カスタムカーを楽しむための基礎知識",
          source: "Web記事・約8分"
        },
        {
          kind: "bridge",
          type: "カルチャー",
          title: "カスタムカーとヒップホップ文化のつながり",
          source: "Web記事・約8分"
        },
        {
          kind: "target",
          type: "トレーニング",
          title: "筋力トレーニングを続ける人が大切にしていること",
          source: "動画・10分"
        },
        {
          kind: "bridge",
          type: "パフォーマンス",
          title: "ライブパフォーマンスを支える体力づくり",
          source: "動画・9分"
        }
      ]
    }
  }
};
