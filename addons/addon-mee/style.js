export default async function ({ addon, console }) {
  window.addon = addon;
  await addon.storage.set("hi", "valneww", "sync");
  console.log(addon.storage.get("ddd", "sync"));
}
