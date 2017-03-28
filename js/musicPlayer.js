$( document ).ready(function() {
   	var showMp = $('#showMusicPlayer');
	var mP = $('#musicPlayer');

	var hideStyle = {
      display : "none"
    };
   	// var showStyle = {
    //   display : ""
    // }; 

	showMp.css(hideStyle);

	// $('#showMusicPlayer').on("click", funcition(){
	// 	mP.css(showStyle);
	// });
// $( "showMusicPlayer" )
//   .on( "click", function() {
//     $(this).remove();
//   });

    console.log( "completed" );
});

// $( "#foo" ).toggleClass( className, addOrRemove );


// $( "p" )
//   .on( "mouseenter", function() {
//     $( this ).css({
//       "background-color": "yellow",
//       "font-weight": "bolder"
//     });
//   })
//   .on( "mouseleave", function() {
//     var styles = {
//       backgroundColor : "#ddd",
//       fontWeight: ""
//     };
//     $( this ).css( styles );
//   });