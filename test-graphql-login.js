const fetch = require('node-fetch');

async function testGraphQLLogin() {
  try {
    console.log('🔍 Testing GraphQL login for branch_admin@chapelstack.com...');
    
    const query = `
      mutation Login($input: SignInDto!) {
        login(input: $input) {
          accessToken
          refreshToken
          user {
            id
            email
            firstName
            lastName
            organisationId
            roles {
              id
              name
            }
            userBranches {
              branch {
                id
                name
              }
              role {
                id
                name
              }
            }
          }
        }
      }
    `;

    const variables = {
      input: {
        email: 'branch_admin@chapelstack.com',
        password: 'password123' // Replace with actual password
      }
    };

    const response = await fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables
      })
    });

    const result = await response.json();
    
    if (result.errors) {
      console.log('❌ GraphQL Errors:', result.errors);
      return;
    }

    if (result.data && result.data.login) {
      const user = result.data.login.user;
      console.log('✅ GraphQL Login Response:');
      console.log('User ID:', user.id);
      console.log('Email:', user.email);
      console.log('Name:', `${user.firstName} ${user.lastName}`);
      console.log('organisationId:', user.organisationId);
      console.log('organisationId type:', typeof user.organisationId);
      console.log('organisationId is null:', user.organisationId === null);
      console.log('organisationId is undefined:', user.organisationId === undefined);
      
      console.log('\n📋 User Branches:');
      if (user.userBranches && user.userBranches.length > 0) {
        user.userBranches.forEach((ub, index) => {
          console.log(`Branch ${index + 1}:`);
          console.log('  Branch ID:', ub.branch.id);
          console.log('  Branch Name:', ub.branch.name);
        });
      }
      
      console.log('\n🔧 Raw Response:');
      console.log(JSON.stringify(user, null, 2));
    } else {
      console.log('❌ No login data in response');
    }

  } catch (error) {
    console.error('❌ Error testing GraphQL login:', error);
  }
}

testGraphQLLogin();
