var App = {
  Views: {},
  Controllers: {},
  Collections: {},
  init: function() {
    new App.Controllers.Documents();
    Backbone.history.start();
  }
};

var Document = Backbone.Model.extend({
    url : function() {
      var base = 'documents';
      if (this.isNew()) return base;
      return base + (base.charAt(base.length - 1) == '/' ? '' : '/') + this.id;
    }
});

App.Collections.Documents = Backbone.Collection.extend({
    model: Document,
    url: 'documents'
});

App.Controllers.Documents = Backbone.Router.extend({
    routes: {
        "documents/:id":            "edit",
        "":                         "index",
        "new":                      "newDoc",
        "destroy/:id":              "destroy"
    },

    edit: function(id) {
        var doc = new Document({ id: id });
        doc.fetch({
            success: function(model, resp) {
                new App.Views.Edit({ model: doc });
            },
            error: function() {
                new Error({ message: 'Could not find that document.' });
                window.location.hash = '#';
            }
        });
    },

    index: function() {
        var documents = new App.Collections.Documents();
        documents.fetch({
            success: function() {
                new App.Views.Index({ collection: documents });
            },
            error: function() {
                new Error({ message: "Error loading documents." });
            }
        });
    },

    newDoc: function() {
        new App.Views.Edit({ model: new Document() });
    },

    destroy: function(id) {
        var doc = new Document({ id: id });
        if (confirm('Really delete ' + doc.id + '?')) {
          doc.destroy({
              success: function(model, resp) {
                  Backbone.history.navigate('', true);
              },
              error: function() {
                  new Error({ message: 'Could not delete document.' });
                  window.location.hash = '#';
              }
          });
        }
        else {
          window.location.hash = '#';
        }
    }
});

App.View = Backbone.View.extend({
    templateBase: 'js/templates/',

    renderTemplate: function(selector, templatePath, view) {
      var context = this;
      $.get(context.templateBase + templatePath, function(template) {
        console.log(view);
        $(context.el).html(Mustache.to_html(template, view || {}));
        $(selector).html(context.el);
      });
    }
});

App.Views.Edit = App.View.extend({
    events: {
        "submit form": "save"
    },

    initialize: function() {
        _.bindAll(this, 'render');
        this.model.bind('change', this.render);
        this.render();
    },

    save: function() {
        var msg = this.model.isNew() ? 'Document created!' : "Document updated!";

        this.model.save({ title: this.$('[name=title]').val(), body: this.$('[name=body]').val() }, {
            success: function(model, resp) {
                new App.Views.Notice({ message: msg });
                Backbone.history.navigate('', true);
            },
            error: function() {
                new App.Views.Error();
            }
        });

        return false;
    },

    render: function() {
        this.renderTemplate('#app', 'edit.html', this.model.attributes);
        this.delegateEvents();
    }
});

App.Views.Index = App.View.extend({
    initialize: function() {
        this.render();
    },

    render: function() {
        this.renderTemplate('#app', 'index.html', this.collection);
    }
});

App.Views.Notice = App.View.extend({
    className: "success",
    displayLength: 5000,
    defaultMessage: '',

    initialize: function() {
        _.bindAll(this, 'render');
        this.message = this.options.message || this.defaultMessage;
        this.render();
    },

    render: function() {
        alert(this.message);
        return this;
    }
});

App.Views.Error = App.Views.Notice.extend({
    className: "error",
    defaultMessage: 'Uh oh! Something went wrong. Please try again.'
});
