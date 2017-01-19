A.app({
    appName: 'CRM DD',
    appIcon: 'phone',
    onlyAuthenticated: false,
    menuItems: [
        {
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
                    bonus: Fields.integer('Бонусы').computed('sum(purchases.value)')
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
                    description: Fields.text('Описание').required(),
                    value: Fields.integer('Стоимость').required()
                },
                referenceName: 'name'
            },
            Purchase: {
                fields: {
                    date: Fields.date('Дата покупки').required(),
                    expireDate: Fields.date('Дата окончания'),
                    client: Fields.reference('Клиент', 'Client').required(),
                    subscription: Fields.reference('Покупка', 'Subscription').required(),
                    value: Fields.integer('Стоимость').readOnly()
                },
                beforeSave: function (Entity, Crud) {
                    return Crud.crudFor('Subscription')
                        .readEntity(Entity.subscription.id)
                        .then(function (item) {
                            Entity.value = item.value;
                        });
                }
            }
        }
    }
});