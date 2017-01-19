A.app({
  appName: 'CusDev CRM',
  appIcon: 'phone',
  onlyAuthenticated: true,
  menuItems: [
    {
      name: 'Contact',
      entityTypeId: 'Contact',
      icon: 'user'
    }, {
      name: 'Board',
      entityTypeId: 'FlowBoard',
      icon: 'bars'
    }, {
      name: 'Statuses',
      entityTypeId: 'Status',
      icon: 'sort'
    }
  ],
  entities: function(Fields) {
    return {
      Contact: {
        fields: {
          name: Fields.text('Name').required(),
          company: Fields.text('Company').required(),
          site: Fields.text('Site'),
          email: Fields.text('Email'),
          skype: Fields.text('Skype'),
          phone: Fields.text('Phone'),
          lastContactDate: Fields.date('Last contact date'),
          status: Fields.fixedReference('Status', 'Status')
        },
        views: {
          FlowBoard: {
            customView: 'board'
          }
        }
      },
      Status: {
        fields: {
          name: Fields.text('Name').required(),
          order: Fields.integer('Order').required()
        },
        sorting: [['order', 1]],
        referenceName: 'name'
      }
    }
  },
});