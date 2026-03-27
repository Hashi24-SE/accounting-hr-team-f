const supabase = require('../config/supabase');

/**
 * Fetch organization record
 */
const getOrganization = async () => {
  const { data, error } = await supabase
    .from('organization')
    .select('*')
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw Object.assign(new Error('Failed to fetch organization'), { status: 500 });
  }

  // PGRST116 is "No rows returned" when using single()
  if (error && error.code === 'PGRST116') {
    return null;
  }

  return data;
};

/**
 * Update or create organization details
 */
const updateOrganization = async (payload) => {
  const existingOrg = await getOrganization();

  let result;
  if (existingOrg) {
    // Update
    result = await supabase
      .from('organization')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingOrg.id)
      .select()
      .single();
  } else {
    // Insert
    result = await supabase
      .from('organization')
      .insert([payload])
      .select()
      .single();
  }

  if (result.error) {
    throw Object.assign(new Error('Failed to update organization'), { status: 500 });
  }

  return result.data;
};

module.exports = {
  getOrganization,
  updateOrganization,
};