var CommentBox = React.createClass({
  loadComments: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        // setState mutates the this.state property
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  commentSubmit: function(comment) {
    var submitedComments = this.state.data;
    comment.id = Date.now();
    this.setState({data: submitedComments.concat([comment])});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: submitedComments});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  // Automatically called on init
  getInitialState: function() {
    return {data: []};
  },
  // Automatically called after first render
  componentDidMount: function() {
    this.loadComments();
    setInterval(this.loadComments(), this.props.pollIntervall)
  },
  render: function() {
    // This.state, unlike this.props, is mutable and a change fires the render of the component again
    return (
      <div className="commentBox">
        <h1>Comentarios: </h1>
        <CommentList data={this.state.data}/>
        <CommentForm onCommentSubmit={this.commentSubmit}/>
      </div>
    );
  }
});
var CommentList = React.createClass({
  render: function() {
    // This.props are inmutable properties inherited from the parent
    var comments = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
        </Comment>
      )
    });
    return (
      <div className="commentList">
        {comments}
      </div>
    );
  }
});
var Comment = React.createClass({
  rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },
  render: function() {
    return (
      <div className="comment">
        <h2 className="commentAuthor">{this.props.author}</h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
      </div>
    );
  }
});
var CommentForm = React.createClass({
  authorChange: function(e) {
    this.setState({author: e.target.value});
  },
  textChange: function(e) {
    this.setState({text: e.target.value});
  },
  submitForm: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      return;
    }
    // callback to the parent through props! Just this easy.
    this.props.onCommentSubmit({author: author, text: text})
    this.setState({author:'', text: ''});
  },
  getInitialState: function() {
    return {author:'', text: ''};
  },
  render: function() {
    return (
      <form className="commentForm" onSubmit={this.submitForm}>
        <input type="text" placeholder="Your name" value={this.state.author} onChange={this.authorChange}/>
        <input type="text" placeholder="Say something..." value={this.state.text} onChange={this.textChange}/>
        <input type="submit" value="Post" />
      </form>
    );
  }
});
ReactDOM.render(
  <CommentBox url="/api/comments" pollIntervall={2000}/>,
  document.getElementById('content')
);
