A.app({
    appName: 'CRM DD',
    appIcon: 'phone',
    onlyAuthenticated: false,
    menuItems: [
        // {
        //     name: 'Преподаватели',
        //     entityTypeId: 'Teacher',
        //     icon: 'user'
        // },
        {
            name: 'Группы',
            entityTypeId: 'Group',
            icon: 'user'
        }, {
            name: 'Клиенты',
            entityTypeId: 'Client',
            icon: 'user'
        }, {
            name: 'Абонементы',
            entityTypeId: 'Subscription',
            icon: 'user'
        }, {
            name: 'Покупка',
            entityTypeId: 'Purchase',
            icon: 'user'
        }
        // {
        //     name: 'Contact',
        //     entityTypeId: 'Contact',
        //     icon: 'user'
        // }, {
        //     name: 'Board',
        //     entityTypeId: 'FlowBoard',
        //     icon: 'bars'
        // }, {
        //     name: 'Statuses',
        //     entityTypeId: 'Status',
        //     icon: 'sort'
        // }
    ],
    entities: function (Fields) {
        return {
            // Teacher: {
            //     fields: {
            //         name: Fields.text('ФИО').required(),
            //         phone: Fields.text('Телефон'),
            //         groups: Fields.reference('Группы', 'Group')
            //     },
            //     referenceName: 'name'
            // },
            Group: {
                fields: {
                    name: Fields.text('Название').required()
                    // clients: Fields.relation('Ученики', 'Client', 'group'),
                    // teacher: Fields.relation('Преподаватели', 'Teacher', 'groups')
                },
                referenceName: 'name'
            },
            Client: {
                fields: {
                    name: Fields.text('ФИО').required(),
                    birthDate: Fields.date('Дата рождения'),
                    vk: Fields.text('Ссылка на профиль в vk'),
                    phone: Fields.text('Телефон'),
                    email: Fields.text('Email'),
                    origin: Fields.text('Откуда узнал о клубе'),
                    // subscription: Fields.multiReference('Абонементы', 'Subscription'),
                    status: Fields.checkbox('Активен'),
                    purchases: Fields.relation('Покупки', 'Purchase', 'client'),
                    bonus: Fields.integer('Бонусы').computed('sum(purchases.bonus)'),
                    group: Fields.multiReference('Группы', 'Group', 'clients')
                },
                views: {
                    Client: {
                        // customView: 'board'
                    }
                },
                referenceName: 'name'
            },
            Subscription: {
                fields: {
                    name: Fields.text('Название').required(),
                    description: Fields.text('Описание'),
                    duration: Fields.integer('Длительность в днях').required(),
                    value: Fields.integer('Стоимость').required()
                },
                referenceName: 'name'
            },
            Purchase: {
                fields: {
                    date: Fields.date('Дата покупки').required(),
                    expireDate: Fields.date('Дата окончания').readOnly(),
                    client: Fields.reference('Клиент', 'Client').required(),
                    subscription: Fields.reference('Покупка', 'Subscription').required(),
                    group: Fields.reference('Группа', 'Group'),
                    value: Fields.integer('Стоимость').readOnly(),
                    bonus: Fields.integer('Бонус за покупку').readOnly()
                },
                beforeSave: function (Entity, Crud) {
                    return Crud.crudFor('Subscription')
                        .readEntity(Entity.subscription.id)
                        .then(function (item) {
                            Entity.value = item.value;
                            Entity.bonus = item.value * 0.1;
                            var expireDate = Entity.date;
                            expireDate = new Date(expireDate);
                            expireDate.setDate(expireDate.getDate() + item.duration);
                            Entity.expireDate = expireDate;
                        });
                },
                afterSave: function (Entity, Crud) {

                }
            }
        }
    }
});