BEGIN;

-- 1. Создаем сам сценарий (пока без start_node_id)
INSERT INTO scenarios (id, title, description, role, difficulty, required_points, start_node_id)
VALUES (
           1,
           'Продажа умного пиксельного дисплея',
           'Вы продаете свой умный пиксельный дисплей Divoom Pixoo 64. Вы выложили объявление буквально 15 минут назад, и вам уже написал первый заинтересованный покупатель.',
           'seller',
           'easy',
           0,
           NULL
       ) ON CONFLICT (id) DO NOTHING;

-- 2. Создаем узлы (ScenarioNodes)
-- ID 1: Узел 1 (Старт)
INSERT INTO scenario_nodes (id, scenario_id, message_text, is_final, final_status)
VALUES (
           1, 1,
           'Добрый день! Очень давно искал именно эту модель, хочу настроить кастомные анимации и циклы. Состояние рабочее? Готов сейчас же оформить доставку.',
           FALSE, NULL
       ) ON CONFLICT (id) DO NOTHING;

-- ID 2: Узел 2 (Развилка)
INSERT INTO scenario_nodes (id, scenario_id, message_text, is_final, final_status)
VALUES (
           2, 1,
           'Отлично, я всё оплатил! Только система почему-то просит указать email продавца, чтобы выслать вам электронный чек и гарантийный талон для курьера. Напишите вашу почту?',
           FALSE, NULL
       ) ON CONFLICT (id) DO NOTHING;

-- ID 3: Узел 3 (Эскалация)
INSERT INTO scenario_nodes (id, scenario_id, message_text, is_final, final_status)
VALUES (
           3, 1,
           'Спасибо! Вам на почту только что должно было прийти письмо от техподдержки с кнопкой "Получить средства". Нажмите её и подтвердите заказ, а то у меня деньги уже списались и висят в холде! Жду 🙏',
           FALSE, NULL
       ) ON CONFLICT (id) DO NOTHING;

-- ID 4: Финальный узел (Отказ на старте)
INSERT INTO scenario_nodes (id, scenario_id, message_text, is_final, final_status)
VALUES (
           4, 1,
           'Диалог завершен. Вы отказались от доставки. Попробуйте пройти сценарий заново, чтобы отработать механику безопасной доставки.',
           TRUE, 'red'
       ) ON CONFLICT (id) DO NOTHING;

-- ID 5: Финальный узел (Успех 100/100)
INSERT INTO scenario_nodes (id, scenario_id, message_text, is_final, final_status)
VALUES (
           5, 1,
           'Мошенник сливается. Вы не поддались на уловку со сбором личных данных и сохранили диалог внутри платформы.',
           TRUE, 'green'
       ) ON CONFLICT (id) DO NOTHING;

-- ID 6: Финальный узел (Успех 60/100 - Желтый)
INSERT INTO scenario_nodes (id, scenario_id, message_text, is_final, final_status)
VALUES (
           6, 1,
           'Передача email-адреса в чате — первый шаг к потере денег. Хорошо, что вы вовремя остановились и не стали открывать фальшивое письмо!',
           TRUE, 'yellow'
       ) ON CONFLICT (id) DO NOTHING;

-- ID 7: Финальный узел (Провал 0/100 - Красный)
INSERT INTO scenario_nodes (id, scenario_id, message_text, is_final, final_status)
VALUES (
           7, 1,
           'Вы перешли на поддельный сайт. В похожей ситуации пользователи платформы теряли деньги, вводя данные своей карты на фишинговом ресурсе.',
           TRUE, 'red'
       ) ON CONFLICT (id) DO NOTHING;

-- 3. Обновляем сценарий, устанавливая стартовый узел
UPDATE scenarios SET start_node_id = 1 WHERE id = 1;

-- 4. Создаем связи (варианты ответов / ScenarioOptions)
-- Из Узла 1
INSERT INTO scenario_options (from_node_id, to_node_id, message_text, status)
VALUES
    (1, 2, 'Да, состояние идеальное. Оформляйте доставку в приложении.', 'green'),
    (1, 4, 'Только личная встреча, доставкой не отправляю.', 'red');

-- Из Узла 2
INSERT INTO scenario_options (from_node_id, to_node_id, message_text, status)
VALUES
    (2, 5, 'Для доставки почта не нужна, всё оформляется внутри площадки.', 'green'),
    (2, 3, 'Да, конечно, вот моя почта: my.email@gmail.com', 'yellow');

-- Из Узла 3
INSERT INTO scenario_options (from_node_id, to_node_id, message_text, status)
VALUES
    (3, 6, 'Пожаловаться в поддержку платформы на подозрительного покупателя', 'yellow'),
    (3, 7, 'Перейти по кнопке "Получить средства" в письме', 'red');

-- 5. Обновляем sequence, чтобы следующие вставки из кода не падали с ошибкой дубликата ID
SELECT setval('scenarios_id_seq', (SELECT MAX(id) FROM scenarios));
SELECT setval('scenario_nodes_id_seq', (SELECT MAX(id) FROM scenario_nodes));

COMMIT;