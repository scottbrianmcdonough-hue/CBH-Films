// CBH's collection pages, as listed on classicbritishhotels.com on 19 Nov 2026 (Scott copied them from the site,
// which blocks this session): the hotels and their places for the TikTok "save for later" lists. Use these names
// and places as written; never guess which hotels have a spa.
export type CollectionHotel = [name: string, place: string];
const P: Record<string, string> = {
  "Atholl Palace Hotel": "Pitlochry, Scotland", "Avisford Park": "Arundel, West Sussex", "Barnett Hill": "Guildford, Surrey",
  "Burleigh Court": "Cotswolds, Stroud", "Coombe Abbey": "Coventry, Warwickshire", "Dalmahoy Hotel & Country Club": "Edinburgh",
  "Dartington Hall": "Totnes, Devon", "Donnington Hotel, Spa & Golf": "Newbury, Berkshire", "Donnington Manor Hotel": "Sevenoaks, Kent",
  "Fairlawns Hotel & Spa": "Walsall", "Forest of Arden Hotel": "Warwickshire", "Frensham Pond Hotel": "Farnham, Surrey",
  "Gisborough Hall": "Guisborough, North York Moors", "Gomersal Park Hotel": "Leeds/Bradford", "Hardwick Hall Hotel": "Sedgefield, County Durham",
  "Hatherley Manor Hotel & Spa": "Cotswolds, Gloucester", "Haycock Manor Hotel": "Peterborough", "Hintlesham Hall Hotel": "Ipswich, Suffolk",
  "Hogarths Solihull": "Solihull", "Hogarths Stone Manor": "Kidderminster, Worcestershire", "Holdsworth House Hotel": "Halifax, West Yorkshire",
  "Hythe Imperial": "Hythe/Folkestone, Kent", "Ilsington Hotel & Spa": "Dartmoor, Devon", "Lake District Castle Inn": "Bassenthwaite/Keswick",
  "Lancaster House Hotel": "Lancaster", "Langshott Manor": "Horley, Surrey", "Langstone Cliff Hotel": "Dawlish, Devon",
  "Low Wood Bay Resort": "Lake Windermere", "Metropole Hotel & Spa": "Llandrindod Wells, Mid Wales", "Morritt Hotel": "Barnard Castle, County Durham",
  "Nailcote Hall Hotel": "Warwickshire", "Oaklands Hall Hotel": "Grimsby, Lincolnshire Wolds", "Oakley Hall Hotel": "Basingstoke, Hampshire",
  "Ramside Hall Hotel": "Durham", "Rowton Hall Hotel & Spa": "Chester", "Ruthin Castle Hotel": "Ruthin, North Wales", "Rutland Hall": "Rutland Water",
  "Skipton Hotel": "Skipton, Yorkshire Dales", "Speech House Hotel": "Forest of Dean", "Stoke by Nayland Resort": "Sudbury, Suffolk",
  "The Alfriston": "South Downs", "The Beaches Hotel & Spa": "Prestatyn, North Wales Coast", "The Imperial Hotel": "Llandudno, North Wales",
  "The Kingfisher": "Bedford", "The Mount": "Wolverhampton", "The Relais Cooden Beach": "Bexhill-on-Sea, East Sussex",
  "The Ridings": "Enfield/Cheshunt, Hertfordshire", "Waterton Park Hotel & Spa": "Wakefield, West Yorkshire",
  "Whitley Hall Country House Hotel": "Sheffield/Peak District", "Whittlebury Park": "Towcester/Silverstone, Northamptonshire",
  "Wild Boar Estate": "Windermere", "Wildes Inns": "Chesterfield, Derbyshire", "Wrightington Hotel": "Wigan, Lancashire",
};
const list = (names: string[]): CollectionHotel[] => names.map((n) => {
  if (!P[n]) throw new Error(`cbh-collections: no place for ${n}`);
  return [n, P[n]];
});
export const SPA = list(["Atholl Palace Hotel", "Barnett Hill", "Burleigh Court", "Donnington Hotel, Spa & Golf", "Fairlawns Hotel & Spa",
  "Forest of Arden Hotel", "Frensham Pond Hotel", "Gisborough Hall", "Gomersal Park Hotel", "Hatherley Manor Hotel & Spa", "Hintlesham Hall Hotel",
  "Hogarths Stone Manor", "Holdsworth House Hotel", "Hythe Imperial", "Ilsington Hotel & Spa", "Lake District Castle Inn", "Lancaster House Hotel",
  "Low Wood Bay Resort", "Metropole Hotel & Spa", "Morritt Hotel", "Ramside Hall Hotel", "Rowton Hall Hotel & Spa", "Ruthin Castle Hotel",
  "Rutland Hall", "Stoke by Nayland Resort", "The Alfriston", "The Beaches Hotel & Spa", "Waterton Park Hotel & Spa", "Whittlebury Park",
  "Wildes Inns", "Wrightington Hotel"]);
export const WATERFRONT = list(["Dartington Hall", "Frensham Pond Hotel", "Hardwick Hall Hotel", "Hythe Imperial", "Langstone Cliff Hotel",
  "Low Wood Bay Resort", "Rutland Hall", "Skipton Hotel", "The Alfriston", "The Beaches Hotel & Spa", "The Imperial Hotel", "The Kingfisher",
  "The Relais Cooden Beach", "Waterton Park Hotel & Spa"]);
export const COUNTRY_HOUSE = list(["Atholl Palace Hotel", "Avisford Park", "Barnett Hill", "Burleigh Court", "Coombe Abbey",
  "Dalmahoy Hotel & Country Club", "Dartington Hall", "Donnington Manor Hotel", "Frensham Pond Hotel", "Gisborough Hall", "Hardwick Hall Hotel",
  "Hatherley Manor Hotel & Spa", "Haycock Manor Hotel", "Hintlesham Hall Hotel", "Hogarths Solihull", "Hogarths Stone Manor",
  "Holdsworth House Hotel", "Ilsington Hotel & Spa", "Lake District Castle Inn", "Langshott Manor", "Metropole Hotel & Spa", "Morritt Hotel",
  "Nailcote Hall Hotel", "Oaklands Hall Hotel", "Oakley Hall Hotel", "Rowton Hall Hotel & Spa", "Rutland Hall", "Speech House Hotel",
  "The Alfriston", "The Kingfisher", "The Mount", "The Ridings", "Waterton Park Hotel & Spa", "Whitley Hall Country House Hotel",
  "Wild Boar Estate"]);
