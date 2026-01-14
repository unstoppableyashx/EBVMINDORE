// js/admin.js
import { auth, db } from "./firebase-config.js";
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";
import { 
    collection, 
    addDoc, 
    getDocs, 
    doc, 
    deleteDoc, 
    updateDoc,
    setDoc,
    query, 
    orderBy,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// --- DOM ELEMENTS ---
const loginView = document.getElementById('login-view');
const dashboardView = document.getElementById('dashboard-view');
const loginForm = document.getElementById('login-form');
const logoutBtn = document.getElementById('logout-btn');
const adminEmailDisplay = document.getElementById('admin-email-display');

// --- AUTHENTICATION STATE OBSERVER ---
// This acts as the "Gatekeeper". It runs automatically when the page loads.
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in.
        console.log("Admin Logged In:", user.email);
        adminEmailDisplay.textContent = user.email;
        
        // Switch UI
        loginView.style.display = 'none';
        dashboardView.style.display = 'flex'; // Restore flex layout
        
        // Load Initial Data
        loadNotices();
        loadPrincipalMessage();
        loadAchievements();
    } else {
        // No user is signed in.
        console.log("No User. Showing Login.");
        loginView.style.display = 'flex';
        dashboardView.style.display = 'none';
    }
});

// --- 1. LOGIN LOGIC ---
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const errorMsg = document.getElementById('login-error');

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            // Signed in successfully
            showToast("Welcome back, Principal.", "success");
            errorMsg.textContent = "";
        })
        .catch((error) => {
            console.error(error);
            errorMsg.textContent = "Invalid Email or Password.";
            showToast("Login Failed", "error");
        });
});

// --- 2. LOGOUT LOGIC ---
logoutBtn.addEventListener('click', () => {
    if(confirm("Are you sure you want to logout?")) {
        signOut(auth).then(() => {
            showToast("Logged out successfully.", "success");
        });
    }
});

// ==========================================
//      CMS MODULES (DATABASE OPERATIONS)
// ==========================================

// --- MODULE A: NOTICE BOARD ---

const noticeForm = document.getElementById('notice-form');
const noticeList = document.getElementById('notice-list-container');

// A1. Add Notice
noticeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titleEn = document.getElementById('notice-title-en').value;
    const titleHi = document.getElementById('notice-title-hi').value;
    const link = document.getElementById('notice-link').value;
    const dateStr = document.getElementById('notice-date').value;
    const priority = document.getElementById('notice-priority').value;

    try {
        await addDoc(collection(db, "notices"), {
            title_en: titleEn,
            title_hi: titleHi,
            link: link,
            date: dateStr,
            priority: priority,
            timestamp: serverTimestamp() // Internal server time for sorting
        });
        
        showToast("Notice Published Successfully", "success");
        noticeForm.reset();
        loadNotices(); // Refresh list
    } catch (e) {
        console.error("Error adding notice: ", e);
        showToast("Error publishing notice", "error");
    }
});

// A2. Load Notices
async function loadNotices() {
    noticeList.innerHTML = '<p>Loading...</p>';
    const q = query(collection(db, "notices"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    
    noticeList.innerHTML = ''; // Clear loading msg
    
    if(querySnapshot.empty){
        noticeList.innerHTML = '<p>No notices found.</p>';
        return;
    }

    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div>
                <strong>${data.date}</strong> - ${data.title_en} 
                ${data.priority === 'high' ? '<span style="color:red; font-weight:bold;">(HIGH)</span>' : ''}
                <br>
                <small style="color:grey;">${data.title_hi || ''}</small>
            </div>
            <button class="btn-delete" onclick="window.deleteNotice('${doc.id}')">Delete</button>
        `;
        noticeList.appendChild(div);
    });
}

// A3. Delete Notice (Attached to window for HTML access)
window.deleteNotice = async (id) => {
    if(confirm("Are you sure you want to delete this notice?")) {
        try {
            await deleteDoc(doc(db, "notices", id));
            showToast("Notice Deleted", "success");
            loadNotices();
        } catch (error) {
            showToast("Error deleting notice", "error");
        }
    }
}

// --- MODULE B: PRINCIPAL'S DESK ---

const principalForm = document.getElementById('principal-form');

// B1. Update Message
principalForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('principal-name').value;
    const msgEn = document.getElementById('principal-msg-en').value;
    const msgHi = document.getElementById('principal-msg-hi').value;

    try {
        // We use setDoc with merge:true to update or create if not exists
        // We store this in a specific ID 'main_message' inside 'principalMessage' collection
        await setDoc(doc(db, "principalMessage", "main_message"), {
            name: name,
            message_en: msgEn,
            message_hi: msgHi,
            updatedAt: serverTimestamp()
        }, { merge: true });
        
        showToast("Principal's Message Updated", "success");
    } catch (e) {
        console.error(error);
        showToast("Error updating message", "error");
    }
});

// B2. Load Message
async function loadPrincipalMessage() {
    try {
        const docRef = doc(db, "principalMessage", "main_message");
        const docSnap = await getDocs(query(collection(db, "principalMessage"))); // Simplified fetch for now
        
        // Actually, let's fetch the specific doc
        // But since we are inside a module, we need to import getDoc. 
        // For simplicity with existing imports, we will iterate (or add getDoc to imports).
        // Let's stick to getDocs for safety if imports are fixed.
        // Better: Let's assume the specific ID approach.
        
        // *Correction*: To use getDoc properly we need to import it. 
        // For now, I will use getDocs on the collection to find it.
        const q = query(collection(db, "principalMessage"));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((doc) => {
            if(doc.id === 'main_message') {
                const data = doc.data();
                document.getElementById('principal-name').value = data.name || '';
                document.getElementById('principal-msg-en').value = data.message_en || '';
                document.getElementById('principal-msg-hi').value = data.message_hi || '';
            }
        });

    } catch (e) {
        console.log("No principal message found yet.");
    }
}


// --- MODULE C: ACHIEVEMENTS ---

const achieveForm = document.getElementById('achieve-form');
const achieveList = document.getElementById('achieve-list-container');

// C1. Add Achievement
achieveForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('achieve-title').value;
    const desc = document.getElementById('achieve-desc').value;

    try {
        await addDoc(collection(db, "achievements"), {
            title: title,
            description: desc,
            timestamp: serverTimestamp()
        });
        showToast("Achievement Added", "success");
        achieveForm.reset();
        loadAchievements();
    } catch (e) {
        showToast("Error adding achievement", "error");
    }
});

// C2. Load Achievements
async function loadAchievements() {
    achieveList.innerHTML = '<p>Loading...</p>';
    const q = query(collection(db, "achievements"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(q);
    
    achieveList.innerHTML = '';
    
    if(snapshot.empty) {
        achieveList.innerHTML = '<p>No achievements recorded.</p>';
        return;
    }

    snapshot.forEach((doc) => {
        const data = doc.data();
        const div = document.createElement('div');
        div.className = 'list-item';
        div.innerHTML = `
            <div><strong>${data.title}</strong><br><small>${data.description}</small></div>
            <button class="btn-delete" onclick="window.deleteAchievement('${doc.id}')">Delete</button>
        `;
        achieveList.appendChild(div);
    });
}

// C3. Delete Achievement
window.deleteAchievement = async (id) => {
    if(confirm("Delete this achievement?")) {
        try {
            await deleteDoc(doc(db, "achievements", id));
            showToast("Achievement Deleted", "success");
            loadAchievements();
        } catch (e) {
            showToast("Error deleting", "error");
        }
    }
}


// --- UTILITIES ---

function showToast(message, type) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}