export default (prov: any) => {
  console.log("dav");
  prov.finally(() => {
    console.log("hej");
  });

  return "ret";
};
