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
                    name: Fields.text('Название').required(),
                    clients: Fields.textarea('Ученики').readOnly(),
                    clientsCount: Fields.integer('Количество учеников').readOnly()
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
                    group: Fields.reference('Группы', 'Group').readOnly(),
                    groupExtra: Fields.reference('Дополнительная группа', 'Group').readOnly(),
                    groupExtra2: Fields.reference('Дополнительная группа', 'Group').readOnly()
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
                afterSave: function (Entity, Crud, Console) {
                    return Crud.crudFor('Client')
                        .readEntity(Entity.client.id)
                        .then(function (item) {
                            var entityGroupId = Entity.group.id;
                            if (item.group && item.group.id == entityGroupId ||
                                item.groupExtra && item.groupExtra.id == entityGroupId ||
                                item.groupExtra2 && item.groupExtra2.id == entityGroupId) {
                                // клиент уже посещает группу
                            } else {
                                if (!item.group) {
                                    Crud.crudFor('Client').updateEntity({
                                        id: item.id,
                                        group: Entity.group
                                    })
                                } else if (!item.groupExtra) {
                                    Crud.crudFor('Client').updateEntity({
                                        id: item.id,
                                        groupExtra: Entity.group
                                    })
                                } else if (!item.groupExtra2) {
                                    Crud.crudFor('Client').updateEntity({
                                        id: item.id,
                                        groupExtra2: Entity.group
                                    })
                                }
                            }

                            Crud.crudFor('Group')
                                .readEntity(entityGroupId)
                                .then(function (item) {
                                    var clients = item.clients;
                                    var currentClientName = Entity.client.name;
                                    if (clients) {
                                        if (clients.indexOf(Entity.client.name) > -1) {
                                            // клиент есть в списке группы
                                        } else {
                                            clients += currentClientName + '\n';
                                        }
                                    } else {
                                        clients = currentClientName + '\n';
                                    }
                                    Crud.crudFor('Group').updateEntity({
                                        id: item.id,
                                        clients: clients,
                                        clientsCount: GroupService.getClientsCount(item)
                                    });
                                })
                        })
                }
            }
        }
    }
});

var GroupService = {
    getClientsCount: function (clientsTextAreaValue) {
        var clientsNames = clientsTextAreaValue.split('\n');
        var result = [];
        for (var e of clientsNames) {
            if (e != '') {
                result.push(e);
            }
        }
        return result.length;
    }
};