/* eslint-disable no-console */
function testDate(){
  var d = Date.parse('Thu, 01 Jan 1970 00:00:00 UTC');
  console.log(d);  
  let e = new Date(d);
  console.log(e.toUTCString());

  d = Date.parse('Tue, 26 Mar 2019 14:34:00 UTC');
  console.log(d);  
  e = new Date(d);
  console.log(e.toUTCString())

  
  d = new Date(1553610840000);
  console.log(d);  
  e = new Date(d);
  console.log(e.toUTCString())
}

testDate();