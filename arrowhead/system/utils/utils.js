/**
 * @author Svetlin Tanyi <szvetlin@aitia.ai> on 2020. 02. 04.
 */

export function getBool(val) {
  if (val === undefined) return false
  return !!JSON.parse(String(val).toLowerCase())
}
