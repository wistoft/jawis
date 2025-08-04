fn main() {
    println!("Hello, world!");
}

#[test]
fn test_succeeds() {
    assert!(true, "should be true")
}

#[test]
fn test_fails() {
    assert!(false, "should fail")
}
