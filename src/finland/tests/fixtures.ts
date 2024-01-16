export const facetDataFixture = {
  facets: {
    audience: {
      buckets: [
        { doc_count: 58, key: "Adult" },
        { doc_count: 4, key: "Young Adult" },
      ],
    },
    collection: {
      buckets: [
        { doc_count: 62, key: "Library Simplified Content Server Crawlable" },
      ],
    },
    data_source: {
      buckets: [
        { doc_count: 49, key: "Standard Ebooks" },
        { doc_count: 9, key: "unglue.it" },
        { doc_count: 4, key: "FeedBooks" },
      ],
    },
    distributor: {
      buckets: [
        { doc_count: 49, key: "Standard Ebooks" },
        { doc_count: 9, key: "unglue.it" },
        { doc_count: 4, key: "FeedBooks" },
      ],
    },
    genres: {
      buckets: [
        { doc_count: 15, key: "Literary Fiction" },
        { doc_count: 12, key: "Adventure" },
        { doc_count: 5, key: "Science Fiction" },
        { doc_count: 4, key: "Horror" },
        { doc_count: 4, key: "Mystery" },
        { doc_count: 4, key: "Short Stories" },
        { doc_count: 3, key: "Drama" },
        { doc_count: 3, key: "Fantasy" },
        { doc_count: 3, key: "Historical Fiction" },
        { doc_count: 3, key: "Humorous Fiction" },
      ],
    },
    imprint: { buckets: [] },
    language: {
      buckets: [
        { doc_count: 59, key: "eng" },
        { doc_count: 3, key: "fre" },
      ],
    },
    library_name: { buckets: [{ doc_count: 62, key: "Open Access Library" }] },
    location: { buckets: [] },
    medium: { buckets: [{ doc_count: 62, key: "Book" }] },
    publisher: { buckets: [{ doc_count: 49, key: "Standard Ebooks" }] },
    type: {
      buckets: [
        { doc_count: 25, key: "circulation_manager_check_out" },
        { doc_count: 20, key: "circulation_manager_fulfill" },
        { doc_count: 17, key: "circulation_manager_check_in" },
      ],
    },
  },
};

export const eventDataFixture = {
  data: {
    audience: [{ doc_count: 16, key: "Adult" }],
    author: [
      { doc_count: 3, key: "Oscar Wilde" },
      { doc_count: 3, key: "Peter Saint-Andre" },
      { doc_count: 3, key: "Thomas Carlyle" },
      { doc_count: 2, key: "Joseph Conrad" },
      { doc_count: 2, key: "Robert Louis Stevenson" },
      { doc_count: 1, key: "H. G. (Herbert George) Wells" },
      { doc_count: 1, key: "Walter Scott" },
      { doc_count: 1, key: "Wilfred Owen" },
    ],
    collection: [
      { doc_count: 16, key: "Library Simplified Content Server Crawlable" },
    ],
    data_source: [
      { doc_count: 13, key: "Standard Ebooks" },
      { doc_count: 3, key: "unglue.it" },
    ],
    distributor: [
      { doc_count: 13, key: "Standard Ebooks" },
      { doc_count: 3, key: "unglue.it" },
    ],
    genres: [
      { doc_count: 4, key: "Adventure" },
      { doc_count: 3, key: "Drama" },
      { doc_count: 3, key: "Humorous Fiction" },
      { doc_count: 2, key: "Literary Fiction" },
      { doc_count: 1, key: "Historical Fiction" },
      { doc_count: 1, key: "Poetry" },
      { doc_count: 1, key: "Romance" },
      { doc_count: 1, key: "Science Fiction" },
    ],
    identifier: [
      {
        doc_count: 3,
        key:
          "https://standardebooks.org/ebooks/oscar-wilde/the-importance-of-being-earnest",
      },
      {
        doc_count: 3,
        key: "https://standardebooks.org/ebooks/thomas-carlyle/sartor-resartus",
      },
      { doc_count: 3, key: "https://unglue.it/api/id/work/137258/" },
      {
        doc_count: 2,
        key: "https://standardebooks.org/ebooks/joseph-conrad/nostromo",
      },
      {
        doc_count: 2,
        key:
          "https://standardebooks.org/ebooks/robert-louis-stevenson/treasure-island/milo-winter",
      },
      {
        doc_count: 1,
        key:
          "https://standardebooks.org/ebooks/h-g-wells/the-island-of-doctor-moreau",
      },
      {
        doc_count: 1,
        key: "https://standardebooks.org/ebooks/walter-scott/ivanhoe",
      },
      {
        doc_count: 1,
        key: "https://standardebooks.org/ebooks/wilfred-owen/poetry",
      },
    ],
    identifier_type: [{ doc_count: 16, key: "URI" }],
    imprint: [],
    language: [{ doc_count: 16, key: "eng" }],
    library_id: [{ doc_count: 16, key: "1" }],
    library_name: [{ doc_count: 16, key: "Open Access Library" }],
    library_short_name: [{ doc_count: 16, key: "op-library" }],
    license_pool_id: [
      { doc_count: 3, key: "1030" },
      { doc_count: 3, key: "5490" },
      { doc_count: 3, key: "918" },
      { doc_count: 2, key: "1517" },
      { doc_count: 2, key: "4912" },
      { doc_count: 1, key: "1501" },
      { doc_count: 1, key: "1519" },
      { doc_count: 1, key: "2308" },
    ],
    location: [],
    medium: [{ doc_count: 16, key: "Book" }],
    publisher: [{ doc_count: 13, key: "Standard Ebooks" }],
    series: [],
    type: [
      { doc_count: 6, key: "circulation_manager_check_out" },
      { doc_count: 6, key: "circulation_manager_fulfill" },
      { doc_count: 4, key: "circulation_manager_check_in" },
    ],
  },
};

export const histogramDataFixture = {
  data: {
    events_per_interval: {
      buckets: [
        {
          key: 1698616800000,
          key_as_string: "2023-10-30T00:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698620400000,
          key_as_string: "2023-10-30T01:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698624000000,
          key_as_string: "2023-10-30T02:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698627600000,
          key_as_string: "2023-10-30T03:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698631200000,
          key_as_string: "2023-10-30T04:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698634800000,
          key_as_string: "2023-10-30T05:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698638400000,
          key_as_string: "2023-10-30T06:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698642000000,
          key_as_string: "2023-10-30T07:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698645600000,
          key_as_string: "2023-10-30T08:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698649200000,
          key_as_string: "2023-10-30T09:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698652800000,
          key_as_string: "2023-10-30T10:00:00.000+02:00",
          type: {
            buckets: [
              { doc_count: 2, key: "circulation_manager_check_in" },
              { doc_count: 2, key: "circulation_manager_fulfill" },
            ],
          },
        },
        {
          key: 1698656400000,
          key_as_string: "2023-10-30T11:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698660000000,
          key_as_string: "2023-10-30T12:00:00.000+02:00",
          type: {
            buckets: [
              { doc_count: 3, key: "circulation_manager_check_out" },
              { doc_count: 1, key: "circulation_manager_check_in" },
            ],
          },
        },
        {
          key: 1698663600000,
          key_as_string: "2023-10-30T13:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698667200000,
          key_as_string: "2023-10-30T14:00:00.000+02:00",
          type: {
            buckets: [
              { doc_count: 4, key: "circulation_manager_fulfill" },
              { doc_count: 3, key: "circulation_manager_check_out" },
              { doc_count: 1, key: "circulation_manager_check_in" },
            ],
          },
        },
        {
          key: 1698670800000,
          key_as_string: "2023-10-30T15:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698674400000,
          key_as_string: "2023-10-30T16:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698678000000,
          key_as_string: "2023-10-30T17:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698681600000,
          key_as_string: "2023-10-30T18:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698685200000,
          key_as_string: "2023-10-30T19:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698688800000,
          key_as_string: "2023-10-30T20:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698692400000,
          key_as_string: "2023-10-30T21:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698696000000,
          key_as_string: "2023-10-30T22:00:00.000+02:00",
          type: { buckets: [] },
        },
        {
          key: 1698699600000,
          key_as_string: "2023-10-30T23:00:00.000+02:00",
          type: { buckets: [] },
        },
      ],
    },
  },
};
