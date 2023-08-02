function lock1(locked) {
  console.info("lock1");
  return locked;
}

function lock2(locked) {
  console.info("lock2");
  return locked;
}

var l1 = lock1(false);
var l2 = lock2(false);

if (l1 && l2) {
  console.info("we are ok");
} else {
  console.warn("we are not ok");
}

const firstName = "a";

function printInfo({ firstName }) {
  //{firstName} = p;

  console.info(p);
}

function printInfo(p) {}

printInfo(firstName); // p ={firstName};
