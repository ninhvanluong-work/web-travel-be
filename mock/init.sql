-- destination
INSERT INTO
    "public"."destination" (
        "created_at",
        "deleted_at",
        "description",
        "id",
        "name",
        "updated_at"
    )
VALUES (
        '2026-03-01 03:21:24.236936+00',
        NULL,
        'Sôi động và nhịp sống hiện đại',
        '2ded0138-bcc5-43d2-9bcd-2411275ce0fe',
        'Miền Nam',
        '2026-03-01 03:21:24.236936+00'
    ),
    (
        '2026-03-01 03:21:24.236936+00',
        NULL,
        'Vùng đất của những di sản và núi cao',
        '431bc370-77c1-46a8-9f7c-16d624ae5bbc',
        'Miền Bắc',
        '2026-03-01 03:21:24.236936+00'
    ),
    (
        '2026-03-01 03:21:24.236936+00',
        NULL,
        'Nơi hội tụ các di sản văn hóa thế giới',
        'cedbb7f1-b1c0-459c-b264-94e11432a5fd',
        'Miền Trung',
        '2026-03-01 03:21:24.236936+00'
    ),
    (
        '2026-03-01 03:21:24.236936+00',
        NULL,
        'Đại ngàn hùng vĩ và văn hóa cồng chiêng',
        'e8a81cb6-6952-4ee0-8b62-065fdb254574',
        'Tây Nguyên',
        '2026-03-01 03:21:24.236936+00'
    );

-- supplier
INSERT INTO
    "public"."supplier" (
        "contact",
        "created_at",
        "deleted_at",
        "id",
        "name",
        "updated_at"
    )
VALUES (
        'hotline@viettravel.com',
        '2026-03-01 03:21:24.236936+00',
        NULL,
        'b7b57788-6fc0-4f65-8e7c-5c000f4d27a4',
        'VietTravel',
        '2026-03-01 03:21:24.236936+00'
    ),
    (
        'contact@saigontourist.net',
        '2026-03-01 03:21:24.236936+00',
        NULL,
        'dc6c8abe-6972-44c9-8328-8a6a9ac74c71',
        'Saigontourist',
        '2026-03-01 03:21:24.236936+00'
    );
-- user
INSERT INTO
    "public"."user" (
        "created_at",
        "deleted_at",
        "email",
        "id",
        "ip_address",
        "updated_at"
    )
VALUES (
        '2026-03-01 03:21:24.236936+00',
        NULL,
        'user3@gmail.com',
        '1846bd2c-09aa-4262-b15b-c9de47f3f644',
        '192.168.1.3',
        '2026-03-01 03:21:24.236936+00'
    ),
    (
        '2026-03-01 03:21:24.236936+00',
        NULL,
        'user1@gmail.com',
        '97f0b84a-3428-45e6-b3b9-03bf0e9983b5',
        '192.168.1.1',
        '2026-03-01 03:21:24.236936+00'
    ),
    (
        '2026-03-01 03:21:24.236936+00',
        NULL,
        'user2@gmail.com',
        'e50ca3ce-0707-4888-9e0e-422bda17885f',
        '192.168.1.2',
        '2026-03-01 03:21:24.236936+00'
    );
-- product
INSERT INTO
    "public"."product" (
        "created_at",
        "deleted_at",
        "description",
        "destination_id",
        "id",
        "name",
        "supplier_id",
        "updated_at"
    )
VALUES (
        '2026-03-01 04:06:20.937585+00',
        NULL,
        'Chinh phục cao nguyên đá',
        '431bc370-77c1-46a8-9f7c-16d624ae5bbc',
        'b26cd710-2919-473e-866e-f12f0df2a1d7',
        'Tour Hà Giang - Mã Pí Lèng',
        'dc6c8abe-6972-44c9-8328-8a6a9ac74c71',
        '2026-03-01 04:06:20.937585+00'
    ),
    (
        '2026-03-01 04:06:20.937585+00',
        NULL,
        'Chợ nổi và rừng tràm',
        '2ded0138-bcc5-43d2-9bcd-2411275ce0fe',
        '50e057cb-af5b-4094-a284-bd4a95027470',
        'Tour Miền Tây sông nước',
        'dc6c8abe-6972-44c9-8328-8a6a9ac74c71',
        '2026-03-01 04:06:20.937585+00'
    ),
    (
        '2026-03-01 04:06:20.937585+00',
        NULL,
        'Du thuyền tham quan vịnh',
        '431bc370-77c1-46a8-9f7c-16d624ae5bbc',
        'fe361d77-88c2-4269-9ea5-b69a72f77ab1',
        'Tour Hạ Long 5 sao',
        'dc6c8abe-6972-44c9-8328-8a6a9ac74c71',
        '2026-03-01 04:06:20.937585+00'
    ),
    (
        '2026-03-01 04:06:20.937585+00',
        NULL,
        'Kết hợp phố cổ và biển Mỹ Khê',
        'cedbb7f1-b1c0-459c-b264-94e11432a5fd',
        '0df1ec7e-166e-4209-810a-23156b3b0489',
        'Tour Đà Nẵng - Hội An',
        'dc6c8abe-6972-44c9-8328-8a6a9ac74c71',
        '2026-03-01 04:06:20.937585+00'
    ),
    (
        '2026-03-01 04:06:20.937585+00',
        NULL,
        'Khám phá thị trấn sương mù',
        '431bc370-77c1-46a8-9f7c-16d624ae5bbc',
        '61a1d4eb-9cb2-4310-a95f-e4a9a5660e37',
        'Tour Sapa Huyền Bí',
        'dc6c8abe-6972-44c9-8328-8a6a9ac74c71',
        '2026-03-01 04:06:20.937585+00'
    ),
    (
        '2026-03-01 04:06:20.937585+00',
        NULL,
        'Khám phá vẻ đẹp đô thị',
        '2ded0138-bcc5-43d2-9bcd-2411275ce0fe',
        '19a2e8f4-38d6-41c1-baa1-31c2f0f897ec',
        'Tour Sài Gòn Năng Động',
        'dc6c8abe-6972-44c9-8328-8a6a9ac74c71',
        '2026-03-01 04:06:20.937585+00'
    ),
    (
        '2026-03-01 04:06:20.937585+00',
        NULL,
        'Nghỉ dưỡng tại thành phố biển',
        '2ded0138-bcc5-43d2-9bcd-2411275ce0fe',
        '3dde9474-2f66-45d2-9951-320a4ae5dc68',
        'Tour Nha Trang Biển Xanh',
        'dc6c8abe-6972-44c9-8328-8a6a9ac74c71',
        '2026-03-01 04:06:20.937585+00'
    ),
    (
        '2026-03-01 04:06:20.937585+00',
        NULL,
        'Thăm cố đô Hoa Lư',
        '431bc370-77c1-46a8-9f7c-16d624ae5bbc',
        '5788e300-1d15-40d8-96db-2e237ddfc753',
        'Tour Tràng An - Ninh Bình',
        'dc6c8abe-6972-44c9-8328-8a6a9ac74c71',
        '2026-03-01 04:06:20.937585+00'
    ),
    (
        '2026-03-01 04:06:20.937585+00',
        NULL,
        'Tham quan Đại Nội và lăng tẩm',
        'cedbb7f1-b1c0-459c-b264-94e11432a5fd',
        '66fd8fd7-cf05-4946-8669-55836629ee2e',
        'Tour Cố đô Huế',
        'dc6c8abe-6972-44c9-8328-8a6a9ac74c71',
        '2026-03-01 04:06:20.937585+00'
    ),
    (
        '2026-03-01 04:06:20.937585+00',
        NULL,
        'Thành phố mộng mơ',
        'e8a81cb6-6952-4ee0-8b62-065fdb254574',
        'f93c372b-631e-451e-8166-e3c8302201f9',
        'Tour Đà Lạt ngàn hoa',
        'dc6c8abe-6972-44c9-8328-8a6a9ac74c71',
        '2026-03-01 04:06:20.937585+00'
    );
-- video
INSERT INTO
    "public"."video" (
        "created_at",
        "deleted_at",
        "description",
        "embedding",
        "id",
        "like",
        "name",
        "product_id",
        "tag",
        "thumbnail",
        "updated_at",
        "url"
    )
VALUES (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Phố cổ Hội An lung linh sắc màu đèn lồng về đêm.',
        NULL,
        '0835db41-2121-4cd8-a67d-69bc70e128fb',
        6109,
        'Du lịch Miền Trung - Hội An',
        '66fd8fd7-cf05-4946-8669-55836629ee2e',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Thành phố Hồ Chí Minh sôi động và náo nhiệt.',
        NULL,
        '1002dd26-e6fc-41b0-bf3c-101f6d8b2ca3',
        9876,
        'Du lịch Miền Nam - Sài Gòn',
        '61a1d4eb-9cb2-4310-a95f-e4a9a5660e37',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Khám phá vẻ đẹp thiên nhiên hùng vĩ và văn hóa độc đáo của miền Bắc Việt Nam.',
        NULL,
        '2ddcb49e-ecd7-4217-a337-0f4361c3f63c',
        4821,
        'Du lịch Miền Bắc',
        'f93c372b-631e-451e-8166-e3c8302201f9',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Cuối tuần thư giãn tại biển Vũng Tàu.',
        NULL,
        '37418d9b-cae4-42ab-ba36-65a0893e6d33',
        8762,
        'Du lịch - Vũng Tàu',
        '61a1d4eb-9cb2-4310-a95f-e4a9a5660e37',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Rừng tràm Trà Sư mùa nước nổi.',
        NULL,
        '411db6e1-faee-4f37-9572-798b2402cd06',
        3321,
        'Du lịch Miền Tây - An Giang',
        '5788e300-1d15-40d8-96db-2e237ddfc753',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Biển xanh cát trắng nắng vàng tại thành phố biển Nha Trang.',
        NULL,
        '6cbd853f-159e-4804-b569-dfb62842f4c2',
        5678,
        'Du lịch Miền Trung - Nha Trang',
        '3dde9474-2f66-45d2-9951-320a4ae5dc68',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Thành phố ngàn hoa với không khí se lạnh quanh năm.',
        NULL,
        '850e6110-02f0-4dbc-8e8d-32ceab3f023f',
        4095,
        'Du lịch - Đà Lạt',
        '5788e300-1d15-40d8-96db-2e237ddfc753',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Chiêm ngưỡng vẻ đẹp kỳ quan thiên nhiên thế giới Vịnh Hạ Long.',
        NULL,
        '94a74157-9e22-46e2-ab7d-34c220e9c499',
        5231,
        'Du lịch Miền Bắc - Hạ Long',
        '3dde9474-2f66-45d2-9951-320a4ae5dc68',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Chợ nổi Cái Răng, nét văn hóa sông nước miền Tây.',
        NULL,
        '9b080bff-de62-4055-b67b-09844c6f5a8e',
        2891,
        'Du lịch Miền Nam - Cần Thơ',
        '19a2e8f4-38d6-41c1-baa1-31c2f0f897ec',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Đồi chè xanh mướt và những mùa hoa cải trắng tinh khôi.',
        NULL,
        'ae211884-7be2-4176-9e62-b0866166a9e6',
        1234,
        'Du lịch Miền Bắc - Mộc Châu',
        '5788e300-1d15-40d8-96db-2e237ddfc753',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Thăm Tràng An, Tam Cốc - Bích Động, cố đô Hoa Lư.',
        NULL,
        'b4cea2c0-8ffe-4c5c-b57e-cb57f1c0c229',
        3672,
        'Du lịch Miền Bắc - Ninh Bình',
        'fe361d77-88c2-4269-9ea5-b69a72f77ab1',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Thành phố đáng sống nhất Việt Nam với cầu Rồng, biển Mỹ Khê.',
        NULL,
        'bda9898b-f4ab-401c-8b18-144af6380c43',
        8415,
        'Du lịch Miền Trung - Đà Nẵng',
        '5788e300-1d15-40d8-96db-2e237ddfc753',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Thiên đường nghỉ dưỡng đảo ngọc Phú Quốc.',
        NULL,
        'cb2e1936-3c7a-48eb-b434-b04c949cbec8',
        7453,
        'Du lịch Miền Nam - Phú Quốc',
        '3dde9474-2f66-45d2-9951-320a4ae5dc68',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Trải nghiệm cung đường đèo Mã Pí Lèng hùng vĩ và cao nguyên đá Đồng Văn.',
        NULL,
        'd412276a-90e3-440e-b70e-bf96aa29664d',
        7894,
        'Du lịch Miền Bắc - Hà Giang',
        'f93c372b-631e-451e-8166-e3c8302201f9',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Tham quan Đại Nội Huế, lăng tẩm các vua Nguyễn.',
        NULL,
        'e21215f4-66d5-4235-82a9-ff2a9969f8cb',
        4387,
        'Du lịch Miền Trung - Huế',
        '5788e300-1d15-40d8-96db-2e237ddfc753',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    ),
    (
        '2026-03-01 04:10:16.132929+00',
        NULL,
        'Khám phá thị trấn sương mù Sapa với những bản làng người Hmong, Dao.',
        NULL,
        'f9553e4e-30f7-478f-aaa8-4c3b3f0e3fd2',
        6548,
        'Du lịch Miền Bắc - Sapa',
        'fe361d77-88c2-4269-9ea5-b69a72f77ab1',
        NULL,
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/Img/anh10.jpg',
        '2026-03-01 04:10:16.132929+00',
        'https://web-travel.sgp1.cdn.digitaloceanspaces.com/dev/dulich-mienbac.mp4'
    );